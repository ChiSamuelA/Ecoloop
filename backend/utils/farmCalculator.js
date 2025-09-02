// Farm Planning Calculator - The AI Brain of Éco Loop
// This module contains the core intelligence for farm recommendations

class FarmCalculator {
    constructor() {
        // Base costs in FCFA (Cameroon prices)
        this.costs = {
            poussin_price: 500,          // Price per chick
            feed_per_kg: 300,            // Feed cost per kg
            feed_consumption: {
                '21_days': 1.2,          // kg per chicken for 21 days
                '30_days': 2.0,          // kg per chicken for 30 days
                '45_days': 3.5           // kg per chicken for 45 days
            },
            medicine_per_chicken: 150,    // Medicine cost per chicken
            misc_percentage: 0.15,        // 15% miscellaneous costs
            mortality_rate: {
                'debutant': 0.15,        // 15% mortality for beginners
                'intermediaire': 0.08,    // 8% mortality for intermediate
                'avance': 0.05           // 5% mortality for advanced
            }
        };
        
        // Market prices and weights
        this.market = {
            selling_price_per_kg: 2500,  // Selling price per kg
            average_weight: {
                '21_days': 1.2,          // kg average weight at 21 days
                '30_days': 1.8,          // kg average weight at 30 days  
                '45_days': 2.5           // kg average weight at 45 days
            }
        };
        
        // Space requirements (chickens per m²)
        this.space_requirements = {
            'debutant': 8,               // Conservative for beginners
            'intermediaire': 10,         // Standard density
            'avance': 12                 // Optimized for experienced
        };
    }

    /**
     * Main calculation method - the core intelligence
     * @param {Object} params - User input parameters
     * @returns {Object} Complete recommendations and analysis
     */
    calculateRecommendations(params) {
        const { budget, espace_m2, experience_level, duration_days } = params;
        
        try {
            // Step 1: Determine cycle type
            const cycleType = this.determineCycleType(duration_days);
            
            // Step 2: Calculate space-based maximum chickens
            const maxChickensFromSpace = this.calculateMaxChickensFromSpace(
                espace_m2, 
                experience_level
            );
            
            // Step 3: Calculate budget-based maximum chickens
            const maxChickensFromBudget = this.calculateMaxChickensFromBudget(
                budget, 
                cycleType, 
                experience_level
            );
            
            // Step 4: Determine optimal number (limiting factor)
            const optimalChickens = Math.min(maxChickensFromSpace, maxChickensFromBudget);
            
            if (optimalChickens <= 0) {
                return this.generateInsufficientResourcesResponse(budget, espace_m2);
            }
            
            // Step 5: Calculate detailed breakdown
            const costBreakdown = this.calculateCostBreakdown(
                optimalChickens, 
                cycleType, 
                experience_level
            );
            
            // Step 6: Calculate profitability
            const profitability = this.calculateProfitability(
                optimalChickens,
                costBreakdown.total_cost,
                cycleType,
                experience_level
            );
            
            // Step 7: Generate recommendations
            const recommendations = this.generateRecommendations(
                optimalChickens,
                costBreakdown,
                profitability,
                cycleType,
                experience_level,
                { budget, espace_m2, duration_days }
            );
            
            return {
                success: true,
                data: recommendations
            };
            
        } catch (error) {
            console.error('❌ Farm calculation error:', error);
            return {
                success: false,
                error: 'Calculation error',
                message: 'Erreur lors du calcul des recommandations'
            };
        }
    }

    /**
     * Determine cycle type based on duration
     */
    determineCycleType(durationDays) {
        if (durationDays <= 21) return '21_days';
        if (durationDays <= 30) return '30_days';
        return '45_days';
    }

    /**
     * Calculate maximum chickens based on available space
     */
    calculateMaxChickensFromSpace(espaceM2, experienceLevel) {
        const chickensPerM2 = this.space_requirements[experienceLevel] || 10;
        return Math.floor(espaceM2 * chickensPerM2);
    }

    /**
     * Calculate maximum chickens based on available budget
     */
    calculateMaxChickensFromBudget(budget, cycleType, experienceLevel) {
        const costPerChicken = this.calculateCostPerChicken(cycleType, experienceLevel);
        return Math.floor(budget / costPerChicken);
    }

    /**
     * Calculate cost per chicken for the entire cycle
     */
    calculateCostPerChicken(cycleType, experienceLevel) {
        const poussinCost = this.costs.poussin_price;
        const feedCost = this.costs.feed_consumption[cycleType] * this.costs.feed_per_kg;
        const medicineCost = this.costs.medicine_per_chicken;
        
        const baseCost = poussinCost + feedCost + medicineCost;
        const miscCost = baseCost * this.costs.misc_percentage;
        
        // Add mortality buffer for inexperienced farmers
        const mortalityRate = this.costs.mortality_rate[experienceLevel];
        const mortalityBuffer = baseCost * mortalityRate;
        
        return Math.ceil(baseCost + miscCost + mortalityBuffer);
    }

    /**
     * Calculate detailed cost breakdown
     */
    calculateCostBreakdown(nbChickens, cycleType, experienceLevel) {
        const poussinsCost = nbChickens * this.costs.poussin_price;
        const feedCost = nbChickens * this.costs.feed_consumption[cycleType] * this.costs.feed_per_kg;
        const medicinesCost = nbChickens * this.costs.medicine_per_chicken;
        
        const subtotal = poussinsCost + feedCost + medicinesCost;
        const diversCost = Math.ceil(subtotal * this.costs.misc_percentage);
        
        // Mortality buffer
        const mortalityRate = this.costs.mortality_rate[experienceLevel];
        const mortalityBuffer = Math.ceil(subtotal * mortalityRate);
        
        const totalCost = subtotal + diversCost + mortalityBuffer;
        
        return {
            poussins: poussinsCost,
            alimentation: feedCost,
            medicaments: medicinesCost,
            divers: diversCost,
            buffer_mortalite: mortalityBuffer,
            total_cost: totalCost
        };
    }

    /**
     * Calculate profitability analysis
     */
    calculateProfitability(nbChickens, totalCost, cycleType, experienceLevel) {
        const mortalityRate = this.costs.mortality_rate[experienceLevel];
        const survivingChickens = Math.floor(nbChickens * (1 - mortalityRate));
        
        const avgWeight = this.market.average_weight[cycleType];
        const pricePerKg = this.market.selling_price_per_kg;
        
        const totalRevenue = survivingChickens * avgWeight * pricePerKg;
        const netProfit = totalRevenue - totalCost;
        const profitPerChicken = netProfit / nbChickens;
        const returnOnInvestment = (netProfit / totalCost) * 100;
        
        return {
            surviving_chickens: survivingChickens,
            total_revenue: Math.ceil(totalRevenue),
            net_profit: Math.ceil(netProfit),
            profit_per_chicken: Math.ceil(profitPerChicken),
            roi_percentage: Math.round(returnOnInvestment * 100) / 100,
            break_even_chickens: Math.ceil(totalCost / (avgWeight * pricePerKg))
        };
    }

    /**
     * Generate comprehensive recommendations
     */
    generateRecommendations(nbChickens, costBreakdown, profitability, cycleType, experienceLevel, userInput) {
        const durationDays = parseInt(cycleType.split('_')[0]);
        
        return {
            summary: {
                nb_poulets_optimal: nbChickens,
                investment_total: costBreakdown.total_cost,
                profit_estime: profitability.net_profit,
                roi_percentage: profitability.roi_percentage,
                duree_cycle: `${durationDays} jours`,
                rentable: profitability.net_profit > 0
            },
            cost_breakdown: {
                poussins: costBreakdown.poussins,
                alimentation: costBreakdown.alimentation,
                medicaments: costBreakdown.medicaments,
                divers: costBreakdown.divers,
                buffer_mortalite: costBreakdown.buffer_mortalite,
                total: costBreakdown.total_cost
            },
            profitability: {
                poulets_survivants: profitability.surviving_chickens,
                chiffre_affaires: profitability.total_revenue,
                benefice_net: profitability.net_profit,
                benefice_par_poulet: profitability.profit_per_chicken,
                retour_investissement: profitability.roi_percentage,
                seuil_rentabilite: profitability.break_even_chickens
            },
            recommendations: this.generateAdvice(nbChickens, experienceLevel, userInput, profitability),
            limiting_factors: this.identifyLimitingFactors(userInput, nbChickens)
        };
    }

    /**
     * Generate personalized advice based on analysis
     */
    generateAdvice(nbChickens, experienceLevel, userInput, profitability) {
        const advice = [];
        
        if (experienceLevel === 'debutant') {
            advice.push("Commencez petit pour acquérir de l'expérience");
            advice.push("Suivez rigoureusement le calendrier de tâches");
            advice.push("Surveillez de près la température et l'humidité");
        }
        
        if (profitability.roi_percentage < 20) {
            advice.push("Rentabilité faible - considérez augmenter l'espace ou le budget");
        } else if (profitability.roi_percentage > 50) {
            advice.push("Excellent potentiel de rentabilité !");
        }
        
        if (userInput.espace_m2 < 10) {
            advice.push("Espace limité - optimisez la gestion de la litière");
        }
        
        advice.push("Préparez un fonds d'urgence de 10% du budget");
        advice.push("Identifiez vos acheteurs avant de commencer");
        
        return advice;
    }

    /**
     * Identify what's limiting the farm size
     */
    identifyLimitingFactors(userInput, optimalChickens) {
        const maxFromSpace = this.calculateMaxChickensFromSpace(
            userInput.espace_m2, 
            userInput.experience_level
        );
        const cycleType = this.determineCycleType(userInput.duration_days);
        const maxFromBudget = this.calculateMaxChickensFromBudget(
            userInput.budget, 
            cycleType, 
            userInput.experience_level
        );
        
        const factors = [];
        
        if (maxFromSpace <= maxFromBudget) {
            factors.push({
                factor: 'Espace disponible',
                current: `${userInput.espace_m2} m²`,
                recommendation: `Augmenter l'espace pour plus de poulets`
            });
        }
        
        if (maxFromBudget <= maxFromSpace) {
            factors.push({
                factor: 'Budget disponible', 
                current: `${userInput.budget.toLocaleString()} FCFA`,
                recommendation: `Augmenter le budget pour plus de poulets`
            });
        }
        
        return factors;
    }

    /**
     * Handle insufficient resources
     */
    generateInsufficientResourcesResponse(budget, espace) {
        return {
            success: false,
            error: 'Insufficient resources',
            message: 'Ressources insuffisantes pour démarrer un élevage rentable',
            suggestions: [
                `Budget minimum recommandé: 50,000 FCFA`,
                `Espace minimum recommandé: 5 m²`,
                'Considérez commencer avec un cycle de 21 jours',
                'Cherchez des financements ou partenariats'
            ]
        };
    }
}

// Export singleton instance
const farmCalculator = new FarmCalculator();
module.exports = farmCalculator;