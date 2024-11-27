import { runtimeLoader as asText } from './asText';
import { runtimeLoader as markdownLoader } from './markdownLoader';

Bun.plugin(asText);
Bun.plugin(markdownLoader);
