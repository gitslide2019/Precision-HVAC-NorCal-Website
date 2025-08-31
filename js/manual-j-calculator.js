/**
 * ACCA Manual J Load Calculation Engine
 * Based on ACCA Manual J 8th Edition standards
 * Simplified implementation for residential load calculations
 */

class ManualJCalculator {
    constructor() {
        this.climateData = this.initializeClimateData();
        this.thermalProperties = this.initializeThermalProperties();
        this.equipmentDatabase = this.initializeEquipmentDatabase();
    }

    // Initialize Bay Area climate data
    initializeClimateData() {
        return {
            // Climate Zone 3 (Bay Area coastal)
            'san-francisco': {
                zone: '3C',
                winterDesignTemp: 35, // 99% heating design temperature
                summerDesignTemp: 85, // 1% cooling design temperature
                summerWetBulb: 65,
                dailyRange: 15,
                windSpeed: 15,
                elevation: 52
            },
            'oakland': {
                zone: '3C',
                winterDesignTemp: 32,
                summerDesignTemp: 87,
                summerWetBulb: 65,
                dailyRange: 18,
                windSpeed: 12,
                elevation: 42
            },
            'berkeley': {
                zone: '3C',
                winterDesignTemp: 33,
                summerDesignTemp: 86,
                summerWetBulb: 65,
                dailyRange: 17,
                windSpeed: 14,
                elevation: 300
            },
            'san-jose': {
                zone: '3C',
                winterDesignTemp: 30,
                summerDesignTemp: 95,
                summerWetBulb: 68,
                dailyRange: 25,
                windSpeed: 8,
                elevation: 82
            },
            // Default Bay Area values
            'default': {
                zone: '3C',
                winterDesignTemp: 32,
                summerDesignTemp: 90,
                summerWetBulb: 66,
                dailyRange: 20,
                windSpeed: 12,
                elevation: 100
            }
        };
    }

    // Initialize thermal properties database
    initializeThermalProperties() {
        return {
            walls: {
                'wood-frame-2x4': { baseR: 4.5, thermalMass: 'light' },
                'wood-frame-2x6': { baseR: 6.0, thermalMass: 'light' },
                'steel-frame': { baseR: 3.0, thermalMass: 'light' },
                'masonry': { baseR: 2.0, thermalMass: 'heavy' },
                'stucco': { baseR: 4.0, thermalMass: 'medium' },
                'log': { baseR: 8.0, thermalMass: 'heavy' }
            },
            windows: {
                'single-pane': { uValue: 1.1, shgc: 0.8 },
                'double-pane': { uValue: 0.5, shgc: 0.7 },
                'double-pane-lowE': { uValue: 0.35, shgc: 0.6 },
                'triple-pane': { uValue: 0.25, shgc: 0.5 },
                'triple-pane-lowE': { uValue: 0.2, shgc: 0.4 }
            },
            roofColors: {
                'light': { absorptance: 0.3 },
                'medium': { absorptance: 0.6 },
                'dark': { absorptance: 0.9 }
            },
            wallColors: {
                'light': { absorptance: 0.3 },
                'medium': { absorptance: 0.6 },
                'dark': { absorptance: 0.9 }
            }
        };
    }

    // Initialize equipment database
    initializeEquipmentDatabase() {
        return {
            heatPumps: [
                {
                    type: 'Ducted Heat Pump',
                    minCapacity: 18000,
                    maxCapacity: 60000,
                    heatingEfficiency: { seer: 16, hspf: 9.0 },
                    coolingEfficiency: { seer: 16 },
                    manufacturer: 'Premium Brand',
                    model: 'HP-Series',
                    costRange: { low: 8000, high: 15000 }
                },
                {
                    type: 'Ductless Mini-Split',
                    minCapacity: 9000,
                    maxCapacity: 36000,
                    heatingEfficiency: { seer: 18, hspf: 10.0 },
                    coolingEfficiency: { seer: 18 },
                    manufacturer: 'Premium Brand',
                    model: 'MS-Series',
                    costRange: { low: 3000, high: 8000 }
                },
                {
                    type: 'Multi-Zone Ductless',
                    minCapacity: 18000,
                    maxCapacity: 48000,
                    heatingEfficiency: { seer: 17, hspf: 9.5 },
                    coolingEfficiency: { seer: 17 },
                    manufacturer: 'Premium Brand',
                    model: 'MZ-Series',
                    costRange: { low: 6000, high: 12000 }
                }
            ]
        };
    }

    // Get climate data for location
    getClimateData(address) {
        const addressLower = address.toLowerCase();
        
        for (const [city, data] of Object.entries(this.climateData)) {
            if (city !== 'default' && addressLower.includes(city.replace('-', ' '))) {
                return data;
            }
        }
        
        return this.climateData.default;
    }

    // Calculate building loads
    calculateLoads(buildingData) {
        const climate = this.getClimateData(buildingData.address);
        
        // Calculate heating load
        const heatingLoad = this.calculateHeatingLoad(buildingData, climate);
        
        // Calculate cooling load
        const coolingLoad = this.calculateCoolingLoad(buildingData, climate);
        
        // Calculate load breakdown
        const loadBreakdown = this.calculateLoadBreakdown(buildingData, climate);
        
        // Calculate monthly energy usage
        const monthlyAnalysis = this.calculateMonthlyAnalysis(buildingData, climate);
        
        return {
            heating: heatingLoad,
            cooling: coolingLoad,
            breakdown: loadBreakdown,
            monthly: monthlyAnalysis,
            climate: climate,
            loadDensity: {
                heating: Math.round(heatingLoad.total / buildingData.totalArea),
                cooling: Math.round(coolingLoad.total / buildingData.totalArea)
            }
        };
    }

    // Calculate heating load (simplified Manual J)
    calculateHeatingLoad(building, climate) {
        const indoorTemp = building.heatingTemp || 70;
        const outdoorTemp = climate.winterDesignTemp;
        const deltaT = indoorTemp - outdoorTemp;
        
        // Calculate envelope loads
        const wallLoad = this.calculateWallHeatingLoad(building, deltaT);
        const windowLoad = this.calculateWindowHeatingLoad(building, deltaT);
        const roofLoad = this.calculateRoofHeatingLoad(building, deltaT);
        const foundationLoad = this.calculateFoundationHeatingLoad(building, deltaT);
        const infiltrationLoad = this.calculateInfiltrationHeatingLoad(building, deltaT);
        
        const total = wallLoad + windowLoad + roofLoad + foundationLoad + infiltrationLoad;
        
        // Apply safety factor (10-20% typical)
        const safetyFactor = 1.15;
        
        return {
            total: Math.round(total * safetyFactor),
            components: {
                walls: Math.round(wallLoad),
                windows: Math.round(windowLoad),
                roof: Math.round(roofLoad),
                foundation: Math.round(foundationLoad),
                infiltration: Math.round(infiltrationLoad)
            },
            designConditions: {
                indoor: indoorTemp,
                outdoor: outdoorTemp,
                deltaT: deltaT
            }
        };
    }

    // Calculate cooling load (simplified Manual J)
    calculateCoolingLoad(building, climate) {
        const indoorTemp = building.coolingTemp || 75;
        const outdoorTemp = climate.summerDesignTemp;
        const deltaT = outdoorTemp - indoorTemp;
        
        // Calculate envelope loads
        const wallLoad = this.calculateWallCoolingLoad(building, deltaT, climate);
        const windowLoad = this.calculateWindowCoolingLoad(building, deltaT, climate);
        const roofLoad = this.calculateRoofCoolingLoad(building, deltaT, climate);
        const foundationLoad = 0; // Typically negligible for cooling
        const infiltrationLoad = this.calculateInfiltrationCoolingLoad(building, deltaT, climate);
        const internalLoad = this.calculateInternalHeatGains(building);
        
        const sensibleTotal = wallLoad + windowLoad + roofLoad + foundationLoad + 
                              infiltrationLoad + internalLoad.sensible;
        const latentTotal = internalLoad.latent + (infiltrationLoad * 0.3); // Approximate latent from infiltration
        
        const total = sensibleTotal + latentTotal;
        
        // Apply safety factor
        const safetyFactor = 1.10;
        
        return {
            total: Math.round(total * safetyFactor),
            sensible: Math.round(sensibleTotal),
            latent: Math.round(latentTotal),
            components: {
                walls: Math.round(wallLoad),
                windows: Math.round(windowLoad),
                roof: Math.round(roofLoad),
                foundation: Math.round(foundationLoad),
                infiltration: Math.round(infiltrationLoad),
                internal: Math.round(internalLoad.sensible + internalLoad.latent)
            },
            designConditions: {
                indoor: indoorTemp,
                outdoor: outdoorTemp,
                deltaT: deltaT,
                wetBulb: climate.summerWetBulb
            }
        };
    }

    // Wall heating load calculation
    calculateWallHeatingLoad(building, deltaT) {
        const wallArea = this.calculateWallArea(building);
        const wallR = this.thermalProperties.walls[building.wallType]?.baseR || 4;
        const insulationR = parseFloat(building.wallInsulation) || 0;
        const totalR = wallR + insulationR;
        
        const uValue = 1 / totalR;
        return wallArea * uValue * deltaT;
    }

    // Window heating load calculation
    calculateWindowHeatingLoad(building, deltaT) {
        const windowArea = this.getTotalWindowArea(building);
        const windowProps = this.thermalProperties.windows[building.windowType];
        const uValue = windowProps?.uValue || 1.1;
        
        return windowArea * uValue * deltaT;
    }

    // Roof heating load calculation
    calculateRoofHeatingLoad(building, deltaT) {
        const roofArea = parseFloat(building.totalArea) || 2000;
        const atticR = parseFloat(building.atticInsulation) || 19;
        
        // Account for attic type
        let effectiveR = atticR;
        if (building.atticType === 'cathedral') {
            effectiveR *= 0.8; // Reduced effectiveness
        }
        
        const uValue = 1 / effectiveR;
        return roofArea * uValue * deltaT;
    }

    // Foundation heating load calculation
    calculateFoundationHeatingLoad(building, deltaT) {
        const floorArea = parseFloat(building.totalArea) || 2000;
        const foundationR = parseFloat(building.foundationInsulation) || 0;
        
        let uValue;
        switch (building.foundationType) {
            case 'slab':
                uValue = 0.1 + (1 / (foundationR + 5)); // Slab edge losses
                break;
            case 'crawlspace-vented':
                uValue = 1 / (foundationR + 6);
                break;
            case 'crawlspace-unvented':
                uValue = 1 / (foundationR + 10);
                break;
            case 'basement-conditioned':
                uValue = 1 / (foundationR + 15);
                break;
            case 'basement-unconditioned':
                uValue = 1 / (foundationR + 8);
                break;
            default:
                uValue = 0.1;
        }
        
        return floorArea * uValue * deltaT * 0.5; // Reduced factor for ground coupling
    }

    // Infiltration heating load calculation
    calculateInfiltrationHeatingLoad(building, deltaT) {
        const volume = (parseFloat(building.totalArea) || 2000) * (parseFloat(building.ceilingHeight) || 9);
        
        // ACH50 estimates based on building age and type
        let ach50;
        const yearBuilt = parseInt(building.yearBuilt) || 2000;
        
        if (yearBuilt > 2010) {
            ach50 = 3.0; // Tighter construction
        } else if (yearBuilt > 1990) {
            ach50 = 5.0;
        } else if (yearBuilt > 1970) {
            ach50 = 8.0;
        } else {
            ach50 = 12.0; // Leakier older homes
        }
        
        // Convert to natural ACH (roughly ACH50 / 20)
        const naturalACH = ach50 / 20;
        
        // CFM of infiltration
        const cfm = (volume * naturalACH) / 60;
        
        // Heating load (1.08 factor for air properties)
        return cfm * 1.08 * deltaT;
    }

    // Wall cooling load calculation
    calculateWallCoolingLoad(building, deltaT, climate) {
        const wallArea = this.calculateWallArea(building);
        const wallR = this.thermalProperties.walls[building.wallType]?.baseR || 4;
        const insulationR = parseFloat(building.wallInsulation) || 0;
        const totalR = wallR + insulationR;
        
        const uValue = 1 / totalR;
        
        // Solar heat gain through walls
        const wallColor = this.thermalProperties.wallColors[building.wallColor] || 
                          this.thermalProperties.wallColors.medium;
        const solarGain = wallArea * wallColor.absorptance * 20; // Simplified solar gain
        
        return (wallArea * uValue * deltaT) + solarGain;
    }

    // Window cooling load calculation
    calculateWindowCoolingLoad(building, deltaT, climate) {
        const windowAreas = {
            north: parseFloat(building.windowAreaNorth) || 0,
            east: parseFloat(building.windowAreaEast) || 0,
            south: parseFloat(building.windowAreaSouth) || 0,
            west: parseFloat(building.windowAreaWest) || 0
        };
        
        const windowProps = this.thermalProperties.windows[building.windowType];
        const uValue = windowProps?.uValue || 1.1;
        const shgc = windowProps?.shgc || 0.7;
        
        // Conductive load
        const totalWindowArea = Object.values(windowAreas).reduce((sum, area) => sum + area, 0);
        const conductiveLoad = totalWindowArea * uValue * deltaT;
        
        // Solar heat gain by orientation
        const solarFactors = { north: 0.2, east: 0.7, south: 0.4, west: 0.9 }; // Peak factors
        let solarLoad = 0;
        
        for (const [orientation, area] of Object.entries(windowAreas)) {
            const solarIntensity = 200 * solarFactors[orientation]; // BTU/hr/sq ft
            solarLoad += area * shgc * solarIntensity;
        }
        
        // Apply shading factor
        const shadingFactor = building.shading === 'none' ? 1.0 : 0.7;
        solarLoad *= shadingFactor;
        
        return conductiveLoad + solarLoad;
    }

    // Roof cooling load calculation
    calculateRoofCoolingLoad(building, deltaT, climate) {
        const roofArea = parseFloat(building.totalArea) || 2000;
        const atticR = parseFloat(building.atticInsulation) || 19;
        
        let effectiveR = atticR;
        if (building.atticType === 'cathedral') {
            effectiveR *= 0.8;
        }
        
        const uValue = 1 / effectiveR;
        
        // Solar heat gain on roof
        const roofColor = this.thermalProperties.roofColors[building.roofColor] || 
                          this.thermalProperties.roofColors.medium;
        const solarGain = roofArea * roofColor.absorptance * 40; // Higher intensity on roof
        
        return (roofArea * uValue * deltaT) + solarGain;
    }

    // Infiltration cooling load calculation
    calculateInfiltrationCoolingLoad(building, deltaT, climate) {
        const volume = (parseFloat(building.totalArea) || 2000) * (parseFloat(building.ceilingHeight) || 9);
        
        let ach50;
        const yearBuilt = parseInt(building.yearBuilt) || 2000;
        
        if (yearBuilt > 2010) {
            ach50 = 3.0;
        } else if (yearBuilt > 1990) {
            ach50 = 5.0;
        } else if (yearBuilt > 1970) {
            ach50 = 8.0;
        } else {
            ach50 = 12.0;
        }
        
        const naturalACH = ach50 / 20;
        const cfm = (volume * naturalACH) / 60;
        
        // Sensible cooling load (1.08 factor for air properties)
        return cfm * 1.08 * deltaT;
    }

    // Internal heat gains calculation
    calculateInternalHeatGains(building) {
        const area = parseFloat(building.totalArea) || 2000;
        const occupants = parseInt(building.occupants) || 4;
        
        // People load (250 BTU/hr sensible + 200 BTU/hr latent per person)
        const peopleLoad = {
            sensible: occupants * 250,
            latent: occupants * 200
        };
        
        // Lighting load (1.5 W/sq ft average)
        const lightingLoad = area * 1.5 * 3.414; // Convert W to BTU/hr
        
        // Appliances and equipment (2 W/sq ft average)
        const equipmentLoad = area * 2 * 3.414;
        
        // Additional loads
        let additionalLoad = 0;
        if (building.poolPump) additionalLoad += 2000;
        if (building.hotTub) additionalLoad += 3000;
        if (building.electricRange) additionalLoad += 1000;
        if (building.electricDryer) additionalLoad += 1500;
        
        return {
            sensible: peopleLoad.sensible + lightingLoad + equipmentLoad + additionalLoad,
            latent: peopleLoad.latent
        };
    }

    // Calculate wall area (simplified)
    calculateWallArea(building) {
        const perimeter = 4 * Math.sqrt(parseFloat(building.totalArea) || 2000);
        const height = parseFloat(building.ceilingHeight) || 9;
        const stories = parseFloat(building.stories) || 1;
        
        const grossWallArea = perimeter * height * stories;
        const windowArea = this.getTotalWindowArea(building);
        const doorArea = 40; // Assume 2 doors at 20 sq ft each
        
        return Math.max(grossWallArea - windowArea - doorArea, 0);
    }

    // Get total window area
    getTotalWindowArea(building) {
        const north = parseFloat(building.windowAreaNorth) || 0;
        const east = parseFloat(building.windowAreaEast) || 0;
        const south = parseFloat(building.windowAreaSouth) || 0;
        const west = parseFloat(building.windowAreaWest) || 0;
        
        return north + east + south + west;
    }

    // Calculate load breakdown for visualization
    calculateLoadBreakdown(building, climate) {
        const heating = this.calculateHeatingLoad(building, climate);
        const cooling = this.calculateCoolingLoad(building, climate);
        
        return {
            heating: {
                labels: ['Walls', 'Windows', 'Roof/Ceiling', 'Foundation', 'Air Infiltration'],
                values: [
                    heating.components.walls,
                    heating.components.windows,
                    heating.components.roof,
                    heating.components.foundation,
                    heating.components.infiltration
                ]
            },
            cooling: {
                labels: ['Walls', 'Windows', 'Roof/Ceiling', 'Foundation', 'Air Infiltration', 'Internal Gains'],
                values: [
                    cooling.components.walls,
                    cooling.components.windows,
                    cooling.components.roof,
                    cooling.components.foundation,
                    cooling.components.infiltration,
                    cooling.components.internal
                ]
            }
        };
    }

    // Calculate monthly energy analysis
    calculateMonthlyAnalysis(building, climate) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        // Simplified monthly temperature profiles for Bay Area
        const monthlyTemps = {
            heating: [45, 48, 52, 55, 58, 62, 62, 62, 60, 56, 50, 46],
            cooling: [60, 62, 65, 68, 72, 75, 77, 77, 75, 70, 65, 60]
        };
        
        const heatingLoad = this.calculateHeatingLoad(building, climate);
        const coolingLoad = this.calculateCoolingLoad(building, climate);
        
        const monthlyData = {
            labels: months,
            heating: [],
            cooling: [],
            total: []
        };
        
        for (let i = 0; i < 12; i++) {
            // Simplified degree-day calculation
            const heatingDegDays = Math.max(0, (building.heatingTemp || 70) - monthlyTemps.heating[i]) * 30;
            const coolingDegDays = Math.max(0, monthlyTemps.cooling[i] - (building.coolingTemp || 75)) * 30;
            
            const monthlyHeating = (heatingLoad.total / 1000) * heatingDegDays / 65; // Normalize to 65°F base
            const monthlyCooling = (coolingLoad.total / 1000) * coolingDegDays / 65;
            
            monthlyData.heating.push(Math.round(monthlyHeating));
            monthlyData.cooling.push(Math.round(monthlyCooling));
            monthlyData.total.push(Math.round(monthlyHeating + monthlyCooling));
        }
        
        return monthlyData;
    }

    // Generate equipment recommendations
    generateRecommendations(loads, building) {
        const recommendations = [];
        
        // Determine system type based on existing ductwork
        const hasGoodDuctwork = building.ductwork === 'excellent' || building.ductwork === 'good';
        
        if (hasGoodDuctwork && loads.heating.total > 18000) {
            // Ducted heat pump system
            const ductedHP = this.equipmentDatabase.heatPumps.find(hp => hp.type === 'Ducted Heat Pump');
            if (ductedHP && loads.heating.total <= ductedHP.maxCapacity) {
                recommendations.push({
                    ...ductedHP,
                    recommended: true,
                    sizingCapacity: Math.ceil(Math.max(loads.heating.total, loads.cooling.total) / 6000) * 6000,
                    annualSavings: this.calculateAnnualSavings(building, ductedHP),
                    rebatesAvailable: this.calculateRebates(ductedHP, building)
                });
            }
        }
        
        // Ductless options
        if (loads.heating.total <= 36000) {
            const ductlessHP = this.equipmentDatabase.heatPumps.find(hp => hp.type === 'Ductless Mini-Split');
            if (ductlessHP) {
                recommendations.push({
                    ...ductlessHP,
                    recommended: !hasGoodDuctwork || loads.heating.total < 24000,
                    sizingCapacity: Math.ceil(Math.max(loads.heating.total, loads.cooling.total) / 3000) * 3000,
                    annualSavings: this.calculateAnnualSavings(building, ductlessHP),
                    rebatesAvailable: this.calculateRebates(ductlessHP, building)
                });
            }
        }
        
        // Multi-zone ductless for larger homes
        if (loads.heating.total > 24000 && loads.heating.total <= 48000) {
            const multiZone = this.equipmentDatabase.heatPumps.find(hp => hp.type === 'Multi-Zone Ductless');
            if (multiZone) {
                recommendations.push({
                    ...multiZone,
                    recommended: !hasGoodDuctwork,
                    sizingCapacity: Math.ceil(Math.max(loads.heating.total, loads.cooling.total) / 6000) * 6000,
                    annualSavings: this.calculateAnnualSavings(building, multiZone),
                    rebatesAvailable: this.calculateRebates(multiZone, building)
                });
            }
        }
        
        return recommendations.sort((a, b) => b.recommended - a.recommended);
    }

    // Calculate annual savings (simplified)
    calculateAnnualSavings(building, equipment) {
        // Get current utility costs
        const currentGasBill = parseFloat(building.currentGasBill) || 150;
        const currentElectricBill = parseFloat(building.currentElectricBill) || 120;
        
        // Estimate current annual heating costs (gas bill * heating months)
        const annualGasCost = currentGasBill * 6; // Assume 6 months heating
        
        // Estimate heat pump efficiency savings
        const hspf = equipment.heatingEfficiency.hspf;
        const seer = equipment.coolingEfficiency.seer;
        
        // Simplified savings calculation
        const heatingEfficiencySavings = annualGasCost * 0.3; // 30% typical savings
        const coolingEfficiencySavings = (currentElectricBill * 4) * 0.2; // 20% cooling savings
        
        return Math.round(heatingEfficiencySavings + coolingEfficiencySavings);
    }

    // Calculate available rebates
    calculateRebates(equipment, building) {
        let totalRebates = 0;
        const rebates = [];
        
        // PG&E Heat Pump Rebates
        if (equipment.heatingEfficiency.hspf >= 8.5) {
            const pgeRebate = 3000;
            totalRebates += pgeRebate;
            rebates.push({ program: 'PG&E Heat Pump Rebate', amount: pgeRebate });
        }
        
        // TECH Clean California
        if (equipment.heatingEfficiency.hspf >= 9.0) {
            const techRebate = 3000;
            totalRebates += techRebate;
            rebates.push({ program: 'TECH Clean California', amount: techRebate });
        }
        
        // Federal Tax Credit (30% of cost, up to system cost)
        const federalCredit = Math.min(equipment.costRange.low * 0.3, 6000);
        totalRebates += federalCredit;
        rebates.push({ program: 'Federal Tax Credit (30%)', amount: Math.round(federalCredit) });
        
        // BAAQMD Incentive
        const baaqmdIncentive = 1500;
        totalRebates += baaqmdIncentive;
        rebates.push({ program: 'BAAQMD Clean Air Incentive', amount: baaqmdIncentive });
        
        return {
            total: Math.round(totalRebates),
            breakdown: rebates
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManualJCalculator;
} else {
    window.ManualJCalculator = ManualJCalculator;
}