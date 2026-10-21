#!/usr/bin/env bun
import { buildClient } from './buildClient';

const { success } = await buildClient();

process.exit(success ? 0 : 1);
