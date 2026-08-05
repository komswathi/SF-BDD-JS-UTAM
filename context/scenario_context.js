let scenarioContext;

class Scenario_context {
    getScenarioContext() {
        if (!scenarioContext) {
            scenarioContext = new Map();
        }
        return scenarioContext;
    }

    setContext(key, value) {
        this.getScenarioContext().set(key, value);
    }

    getContext(key) {
        return this.getScenarioContext().get(key);
    }
}

export default new Scenario_context();
