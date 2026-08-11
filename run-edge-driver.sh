#!/bin/bash

# Wrapper script that sets environment for edgedriver to use local binary
# Usage: ./run-edge-driver.sh

export EDGEDRIVER_CACHE_DIR=/Users/swathikomeravelli/Automation/UTAM/SF-BDD-JS-UTAM/drivers/edge/mac
export EDGEDRIVER_VERSION=151.0.4129.72

# Run wdio with the edge config
npx wdio run wdio.conf.edge.js "$@"
