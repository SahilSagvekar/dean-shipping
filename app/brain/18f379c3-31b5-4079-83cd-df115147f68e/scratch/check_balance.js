
import fs from 'fs';

const content = fs.readFileSync('d:/Shipping/dean-shipping-ltd/app/(dashboard)/vehicle-management/page.tsx', 'utf8');

let curly = 0;
let paren = 0;
let square = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') curly++;
    if (char === '}') curly--;
    if (char === '(') paren++;
    if (char === ')') paren--;
    if (char === '[') square++;
    if (char === ']') square--;
}

console.log({ curly, paren, square });
