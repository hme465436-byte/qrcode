import { config } from 'dotenv';
config();

import '@/ai/flows/qr-content-refiner-flow.ts';
import '@/ai/flows/qr-content-type-suggester-flow.ts';
import '@/ai/flows/qr-background-generator-flow.ts';
import '@/ai/flows/web-image-extractor-flow.ts';
import '@/ai/flows/ai-humanizer-flow.ts';
