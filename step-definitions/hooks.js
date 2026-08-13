import { Before, After } from '@cucumber/cucumber';
import scenarioContext from '../context/scenario_context.js';
import logger from '../utils/logger.js';

Before(function(scenario) {
    // Attach scenario name to world - accessible in all steps
    this.scenarioName = scenario.pickle.name;
    logger.info(`📋 Starting scenario: ${this.scenarioName}`);
});

After(function(scenario) {
    logger.info(`✓ Scenario completed: ${scenario.result.status}`);
    scenarioContext.getScenarioContext().clear();
    logger.debug('Scenario Context cleared');
});