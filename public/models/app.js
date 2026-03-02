class MiniNet {

    constructor(input = 400, hidden = 64, output = 36, lr = 0.01) {

        this.input = input;
        this.hidden = hidden;
        this.output = output;
        this.lr = lr;

        this.w1 = new Float32Array(input * hidden);
        this.w2 = new Float32Array(hidden * output);

        this.b1 = new Float32Array(hidden);
        this.b2 = new Float32Array(output);

        this.initWeights();
    }

    initWeights() {
        for (let i = 0; i < this.w1.length; i++)
            this.w1[i] = (Math.random() - 0.5) * 0.1;

        for (let i = 0; i < this.w2.length; i++)
            this.w2[i] = (Math.random() - 0.5) * 0.1;
    }

    relu(x) {
        return x > 0 ? x : 0;
    }

    reluDeriv(x) {
        return x > 0 ? 1 : 0;
    }

    softmax(arr) {
        let max = -Infinity;
        for (let v of arr) if (v > max) max = v;

        let sum = 0;
        const exps = new Float32Array(arr.length);

        for (let i = 0; i < arr.length; i++) {
            exps[i] = Math.exp(arr[i] - max);
            sum += exps[i];
        }

        for (let i = 0; i < arr.length; i++)
            exps[i] /= sum;

        return exps;
    }

    forward(inputVec) {

        this.lastInput = inputVec;

        this.hiddenRaw = new Float32Array(this.hidden);
        this.hiddenAct = new Float32Array(this.hidden);

        for (let h = 0; h < this.hidden; h++) {

            let sum = this.b1[h];

            for (let i = 0; i < this.input; i++)
                sum += inputVec[i] * this.w1[i * this.hidden + h];

            this.hiddenRaw[h] = sum;
            this.hiddenAct[h] = this.relu(sum);
        }

        this.outRaw = new Float32Array(this.output);

        for (let o = 0; o < this.output; o++) {

            let sum = this.b2[o];

            for (let h = 0; h < this.hidden; h++)
                sum += this.hiddenAct[h] * this.w2[h * this.output + o];

            this.outRaw[o] = sum;
        }

        this.out = this.softmax(this.outRaw);
        return this.out;
    }

    train(inputVec, labelIndex) {

        const out = this.forward(inputVec);

        const gradOut = new Float32Array(this.output);

        for (let i = 0; i < this.output; i++) {
            gradOut[i] = out[i] - (i === labelIndex ? 1 : 0);
        }

        const gradHidden = new Float32Array(this.hidden);

        for (let h = 0; h < this.hidden; h++) {

            let sum = 0;

            for (let o = 0; o < this.output; o++) {
                sum += gradOut[o] * this.w2[h * this.output + o];
            }

            gradHidden[h] = sum * this.reluDeriv(this.hiddenRaw[h]);
        }

        // update w2
        for (let h = 0; h < this.hidden; h++) {
            for (let o = 0; o < this.output; o++) {
                this.w2[h * this.output + o] -=
                    this.lr * gradOut[o] * this.hiddenAct[h];
            }
        }

        // update w1
        for (let i = 0; i < this.input; i++) {
            for (let h = 0; h < this.hidden; h++) {
                this.w1[i * this.hidden + h] -=
                    this.lr * gradHidden[h] * inputVec[i];
            }
        }

        for (let o = 0; o < this.output; o++)
            this.b2[o] -= this.lr * gradOut[o];

        for (let h = 0; h < this.hidden; h++)
            this.b1[h] -= this.lr * gradHidden[h];
    }

    predict(vec) {
        const out = this.forward(vec);

        let max = 0;
        let id = 0;

        for (let i = 0; i < out.length; i++) {
            if (out[i] > max) {
                max = out[i];
                id = i;
            }
        }

        return { id, confidence: max };
    }
}
























class SimpleOCREngine {

    constructor(canvas) {
        this.k = 450;
        this.minRegion = 40;
        this.canvas = canvas;
    }

    run(width, height, data) {

        const segments = this.segment(width, height, data);
        const components = this.extractComponents(width, height, segments);
        //const symbols = this.filterSymbols(components);
        const rawSymbols = components.map(c => {
            const w = c.maxX - c.minX + 1;
            const h = c.maxY - c.minY + 1;

            return {
                x: c.minX,
                y: c.minY,
                w,
                h,
                cx: c.minX + w / 2,
                cy: c.minY + h / 2,
                pixels: c.pixels
            };
        });

        const symbols = this.filterSymbols(rawSymbols);

        const lines = this.buildLines(symbols);
        const words = this.buildWords(lines);

        console.log("segments", segments.count);
        console.log("symbols", symbols.length);
        console.log("lines", lines.length);
        console.log("words", words.length);

        return { segments, components, symbols, lines, words };
    }

    // =========================
    // SEGMENTATION
    // =========================

    segment(width, height, data) {

        const size = width * height;

        const parent = new Int32Array(size);
        const compSize = new Int32Array(size);
        const internal = new Float32Array(size);

        for (let i = 0; i < size; i++) {
            parent[i] = i;
            compSize[i] = 1;
            internal[i] = 0;
        }

        const find = (x) => {
            while (parent[x] !== x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };

        const union = (a, b, w) => {
            a = find(a);
            b = find(b);
            if (a === b) return;

            parent[b] = a;
            compSize[a] += compSize[b];
            internal[a] = Math.max(w, internal[a], internal[b]);
        };

        const diff = (i1, i2) => {
            const p1 = i1 * 4;
            const p2 = i2 * 4;

            const dr = data[p1] - data[p2];
            const dg = data[p1 + 1] - data[p2 + 1];
            const db = data[p1 + 2] - data[p2 + 2];

            return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        const edges = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const i = y * width + x;

                if (x < width - 1)
                    edges.push({ a: i, b: i + 1, w: diff(i, i + 1) });

                if (y < height - 1)
                    edges.push({ a: i, b: i + width, w: diff(i, i + width) });
            }
        }

        edges.sort((a, b) => a.w - b.w);

        const threshold = (size) => this.k / size;

        for (const e of edges) {

            let a = find(e.a);
            let b = find(e.b);
            if (a === b) continue;

            if (
                e.w <= internal[a] + threshold(compSize[a]) &&
                e.w <= internal[b] + threshold(compSize[b])
            ) {
                union(a, b, e.w);
            }
        }

        for (const e of edges) {

            let a = find(e.a);
            let b = find(e.b);

            if (a !== b &&
                (compSize[a] < this.minRegion || compSize[b] < this.minRegion)) {
                union(a, b, e.w);
            }
        }

        return {
            parent,
            find,
            count: parent.length
        };
    }

    // =========================
    // COMPONENTS
    // =========================

    extractComponents(width, height, segments) {

        const map = new Map();
        const size = width * height;

        for (let i = 0; i < size; i++) {

            const root = segments.find(i);

            if (!map.has(root)) {
                map.set(root, {
                    pixels: 0,
                    minX: width,
                    minY: height,
                    maxX: 0,
                    maxY: 0
                });
            }

            const c = map.get(root);

            const x = i % width;
            const y = (i / width) | 0;

            c.pixels++;

            if (x < c.minX) c.minX = x;
            if (y < c.minY) c.minY = y;
            if (x > c.maxX) c.maxX = x;
            if (y > c.maxY) c.maxY = y;
        }

        return Array.from(map.values());
    }

    // =========================
    // SYMBOL FILTER
    // =========================

    filterSymbols(components) {

        const symbols = [];

        for (const c of components) {

            const w = c.maxX - c.minX;
            const h = c.maxY - c.minY;
            const ratio = w / (h || 1);

            if (
                c.pixels > 60 &&
                w > 5 &&
                h > 10 &&
                ratio > 0.1 &&
                ratio < 1.2
            ) {
                symbols.push({
                    x: c.minX,
                    y: c.minY,
                    w,
                    h,
                    cx: c.minX + w / 2,
                    cy: c.minY + h / 2
                });
            }
        }

        return symbols;
    }
    //filterSymbols(components) {

    //    const symbols = [];

    //    for (const c of components) {

    //        const w = c.maxX - c.minX + 1;
    //        const h = c.maxY - c.minY + 1;

    //        if (w < 4 || h < 8) continue;
    //        if (c.pixels < 30) continue;

    //        const area = w * h;
    //        const density = c.pixels / area;

    //        // фильтр плотности символа
    //        if (density < 0.12 || density > 0.85) continue;

    //        const ratio = w / h;

    //        // символы обычно не очень широкие
    //        if (ratio > 1.5) continue;

    //        symbols.push({
    //            x: c.minX,
    //            y: c.minY,
    //            w,
    //            h,
    //            cx: c.minX + w / 2,
    //            cy: c.minY + h / 2,
    //            density
    //        });
    //    }

    //    return symbols;
    //}

    //filterSymbols(symbols) {
    //    const filtered = [];

    //    for (const s of symbols) {

    //        const area = s.w * s.h;
    //        const ratio = s.w / s.h;



    //        // минимальный размер
    //        if (s.w < 6 || s.h < 10) continue;

    //        // слишком большие (не символ)
    //        if (s.w > 120 || s.h > 120) continue;

    //        // странная форма
    //        if (ratio < 0.1 || ratio > 1.5) continue;

    //        // площадь
    //        if (area < 250) continue;

    //        filtered.push(s);
    //    }

    //    return filtered;
    //}
    //filterSymbols(symbols) {
    //    const filtered = [];

    //    for (const s of symbols) {

    //        const area = s.w * s.h;
    //        const ratio = s.w / s.h;
    //        const density = s.pixels / area;

    //        if (s.w < 8 || s.h < 12) continue;
    //        if (s.w > 120 || s.h > 120) continue;
    //        if (ratio < 0.15 || ratio > 1.3) continue;
    //        if (area < 140) continue;
    //        if (density < 0.15 || density > 0.9) continue;

    //        filtered.push(s);
    //    }

    //    return filtered;
    //}

    // =========================
    // LINES
    // =========================

    buildLines(symbols) {

        const lines = [];

        for (const s of symbols) {

            let placed = false;

            for (const line of lines) {
                if (Math.abs(line.y - s.cy) < 25) {
                    line.symbols.push(s);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                lines.push({
                    y: s.cy,
                    symbols: [s]
                });
            }
        }

        for (const line of lines) {
            line.symbols.sort((a, b) => a.x - b.x);
        }

        return lines;
    }

    // =========================
    // WORDS
    // =========================

    buildWords(lines) {

        const words = [];

        for (const line of lines) {

            let currentWord = [];

            for (let i = 0; i < line.symbols.length; i++) {

                const s = line.symbols[i];
                const next = line.symbols[i + 1];

                currentWord.push(s);

                if (!next) {
                    words.push(currentWord);
                    break;
                }

                const gap = next.x - (s.x + s.w);

                if (gap > 15) {
                    words.push(currentWord);
                    currentWord = [];
                }
            }
        }

        return words;
    }
    extractSymbolBitmap(symbol, width, height, data, size = 20) {

        const bitmap = new Float32Array(size * size);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {

                const sx = Math.floor(symbol.x + (x / size) * symbol.w);
                const sy = Math.floor(symbol.y + (y / size) * symbol.h);

                const i = (sy * width + sx) * 4;

                const v =
                    data[i] * 0.299 +
                    data[i + 1] * 0.587 +
                    data[i + 2] * 0.114;

                bitmap[y * size + x] = v / 255;
            }
        }

        return bitmap;
    }
    recognizeSymbols(symbols, width, height, data, net) {
        const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const results = [];

        for (const s of symbols) {

            const bitmap = this.extractSymbolBitmap(s, width, height, data);

            const pred = net.predict(bitmap);

            results.push({
                char: CHARSET[pred.id],
                confidence: pred.confidence,
                box: s
            });
        }

        return results;
    }
    trainOnClick(symbols, width, height, data, net) {
        const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.canvas.addEventListener("click", (e) => {

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (const s of symbols) {

                if (
                    x >= s.x &&
                    x <= s.x + s.w &&
                    y >= s.y &&
                    y <= s.y + s.h
                ) {

                    const char = prompt("Введите символ:");

                    if (!char) return;

                    const idx = CHARSET.indexOf(char.toUpperCase());
                    if (idx === -1) return;

                    const bitmap =
                        this.extractSymbolBitmap(s, width, height, data);

                    net.train(bitmap, idx);

                    console.log("обучено:", char);

                    break;
                }
            }
        });
    }
    drawSymbols(ctx, symbols) {

        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";

        for (const s of symbols) {
            ctx.strokeRect(s.x, s.y, s.w, s.h);
        }
    }
    binarizeAdaptive(width, height, data, radius = 8, bias = 7) {

        const gray = new Float32Array(width * height);

        // перевод в grayscale
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
            gray[p] =
                data[i] * 0.299 +
                data[i + 1] * 0.587 +
                data[i + 2] * 0.114;
        }

        const out = new Uint8Array(width * height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                let sum = 0;
                let count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    const yy = y + dy;
                    if (yy < 0 || yy >= height) continue;

                    for (let dx = -radius; dx <= radius; dx++) {
                        const xx = x + dx;
                        if (xx < 0 || xx >= width) continue;

                        sum += gray[yy * width + xx];
                        count++;
                    }
                }

                const mean = sum / count;
                const i = y * width + x;

                out[i] = gray[i] < mean - bias ? 0 : 255;
            }
        }

        // записываем обратно
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
            const v = out[p];
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
        }
    }
    boxBlur(width, height, data) {

        const copy = new Uint8ClampedArray(data);

        const get = (x, y, c) => {
            const i = (y * width + x) * 4 + c;
            return copy[i];
        };

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                for (let c = 0; c < 3; c++) {

                    let sum = 0;

                    for (let dy = -1; dy <= 1; dy++)
                        for (let dx = -1; dx <= 1; dx++)
                            sum += get(x + dx, y + dy, c);

                    const i = (y * width + x) * 4 + c;
                    data[i] = sum / 9;
                }
            }
        }
    }
    removeNoise(width, height, data) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            const i = (y * width + x) * 4;
            return copy[i]; // grayscale
        };

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                let black = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (get(x + dx, y + dy) === 0) black++;
                    }
                }

                const i = (y * width + x) * 4;

                // если слишком мало соседей — шум
                if (black <= 2) {
                    data[i] = data[i + 1] = data[i + 2] = 255;
                }
            }
        }
    }
    dilate(width, height, data) {

        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            const i = (y * width + x) * 4;
            return copy[i];
        };

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                let black = 0;

                for (let dy = -1; dy <= 1; dy++)
                    for (let dx = -1; dx <= 1; dx++)
                        if (get(x + dx, y + dy) === 0) black++;

                if (black > 2) {
                    const i = (y * width + x) * 4;
                    data[i] = data[i + 1] = data[i + 2] = 0;
                }
            }
        }
    }
    findConnectedComponents(width, height, data) {

        const visited = new Uint8Array(width * height);
        const symbols = [];

        const get = (x, y) => {
            const i = (y * width + x) * 4;
            return data[i] === 0;
        };

        const stack = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const idx = y * width + x;
                if (visited[idx]) continue;
                if (!get(x, y)) continue;

                let minX = x, minY = y;
                let maxX = x, maxY = y;

                stack.push([x, y]);
                visited[idx] = 1;

                while (stack.length) {
                    const [cx, cy] = stack.pop();

                    minX = Math.min(minX, cx);
                    minY = Math.min(minY, cy);
                    maxX = Math.max(maxX, cx);
                    maxY = Math.max(maxY, cy);

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {

                            const nx = cx + dx;
                            const ny = cy + dy;

                            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                            const nidx = ny * width + nx;
                            if (visited[nidx]) continue;
                            if (!get(nx, ny)) continue;

                            visited[nidx] = 1;
                            stack.push([nx, ny]);
                        }
                    }
                }

                symbols.push({
                    x: minX,
                    y: minY,
                    w: maxX - minX + 1,
                    h: maxY - minY + 1
                });
            }
        }

        return symbols;
    }

}



























class MiniOCREngine2 {

    constructor() { }

    // =========================
    // PREPROCESS
    // =========================

    grayscale(w, h, data) {
        for (let i = 0; i < w * h; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];

            const gray = (r * 0.299 + g * 0.587 + b * 0.114) | 0;

            data[i * 4] =
                data[i * 4 + 1] =
                data[i * 4 + 2] = gray;
        }
    }

    boxBlur(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                let sum = 0;
                let count = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {

                        const nx = x + dx;
                        const ny = y + dy;
                        const i = (ny * w + nx) * 4;

                        sum += copy[i];
                        count++;
                    }
                }

                const gray = sum / count;
                const i = (y * w + x) * 4;

                data[i] =
                    data[i + 1] =
                    data[i + 2] = gray;
            }
        }
    }

    binarizeAdaptive(w, h, data, radius = 12, bias = 3) {
        const gray = new Uint8Array(w * h);

        for (let i = 0; i < w * h; i++) {
            gray[i] = data[i * 4];
        }

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let sum = 0;
                let count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    const ny = y + dy;
                    if (ny < 0 || ny >= h) continue;

                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        if (nx < 0 || nx >= w) continue;

                        sum += gray[ny * w + nx];
                        count++;
                    }
                }

                const mean = sum / count;
                const i = (y * w + x) * 4;

                const value = gray[y * w + x] < mean - bias ? 0 : 255;

                data[i] =
                    data[i + 1] =
                    data[i + 2] = value;
            }
        }
    }

    removeNoise(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                let neighbors = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {

                        if (dx === 0 && dy === 0) continue;

                        const nx = x + dx;
                        const ny = y + dy;
                        const i = (ny * w + nx) * 4;

                        if (copy[i] === 0) neighbors++;
                    }
                }

                const i = (y * w + x) * 4;

                if (neighbors < 2) {
                    data[i] =
                        data[i + 1] =
                        data[i + 2] = 255;
                }
            }
        }
    }

    erode(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                let black = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {

                        const nx = x + dx;
                        const ny = y + dy;
                        const i = (ny * w + nx) * 4;

                        if (copy[i] === 0) black++;
                    }
                }

                const i = (y * w + x) * 4;

                if (black < 3) {
                    data[i] =
                        data[i + 1] =
                        data[i + 2] = 255;
                }
            }
        }
    }

    dilate(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                let black = false;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {

                        const nx = x + dx;
                        const ny = y + dy;
                        const i = (ny * w + nx) * 4;

                        if (copy[i] === 0) {
                            black = true;
                        }
                    }
                }

                const i = (y * w + x) * 4;

                if (black) {
                    data[i] =
                        data[i + 1] =
                        data[i + 2] = 0;
                }
            }
        }
    }

    // =========================
    // CONNECTED COMPONENTS
    // =========================

    findConnectedComponents(w, h, data) {

        const visited = new Uint8Array(w * h);
        const symbols = [];

        const stack = [];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                const idx = y * w + x;
                const i = idx * 4;

                if (visited[idx]) continue;
                if (data[i] !== 0) continue;

                let minX = x;
                let minY = y;
                let maxX = x;
                let maxY = y;
                let pixels = 0;

                stack.push(idx);
                visited[idx] = 1;

                while (stack.length) {
                    const p = stack.pop();
                    const px = p % w;
                    const py = (p / w) | 0;

                    pixels++;

                    if (px < minX) minX = px;
                    if (py < minY) minY = py;
                    if (px > maxX) maxX = px;
                    if (py > maxY) maxY = py;

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {

                            const nx = px + dx;
                            const ny = py + dy;

                            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

                            const ni = ny * w + nx;

                            if (visited[ni]) continue;

                            const di = ni * 4;

                            if (data[di] === 0) {
                                visited[ni] = 1;
                                stack.push(ni);
                            }
                        }
                    }
                }

                const wbox = maxX - minX + 1;
                const hbox = maxY - minY + 1;
                const area = wbox * hbox;
                const density = pixels / area;

                if (
                    area > 200 &&
                    wbox > 6 &&
                    hbox > 10 &&
                    density > 0.15
                ) {
                    symbols.push({
                        x: minX,
                        y: minY,
                        w: wbox,
                        h: hbox,
                        pixels
                    });
                }
            }
        }

        return symbols;
    }

}



class MiniOCREngine {

    grayscale(w, h, data) {
        for (let i = 0; i < w * h; i++) {
            const p = i * 4;
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];
            const gray = (0.299 * r + 0.587 * g + 0.114 * b) | 0;

            data[p] = gray;
            data[p + 1] = gray;
            data[p + 2] = gray;
        }
    }

    boxBlur2(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            x = Math.max(0, Math.min(w - 1, x));
            y = Math.max(0, Math.min(h - 1, y));
            return copy[(y * w + x) * 4];
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sum = 0;
                let count = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        sum += get(x + kx, y + ky);
                        count++;
                    }
                }

                const v = (sum / count) | 0;
                const p = (y * w + x) * 4;

                data[p] = v;
                data[p + 1] = v;
                data[p + 2] = v;
            }
        }
    }
    //radius = 1 → окно 3×3
    //radius = 2 → окно 5×5
    //radius = 3 → окно 7×7
    boxBlur(w, h, data, radius = 3, passes = 2) {
        for (let pass = 0; pass < passes; pass++) {

            const copy = new Uint8ClampedArray(data);

            const get = (x, y) => {
                x = x < 0 ? 0 : x >= w ? w - 1 : x;
                y = y < 0 ? 0 : y >= h ? h - 1 : y;
                return copy[(y * w + x) * 4];
            };

            const size = radius * 2 + 1;
            const area = size * size;

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {

                    let sum = 0;

                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            sum += get(x + kx, y + ky);
                        }
                    }

                    const v = (sum / area) | 0;
                    const p = (y * w + x) * 4;

                    data[p] = v;
                    data[p + 1] = v;
                    data[p + 2] = v;
                }
            }
        }
    }

    binarizeAdaptive3(w, h, data, blockSize = 35, C = 8) {
        const copy = new Uint8ClampedArray(data);

        const half = (blockSize / 2) | 0;

        const get = (x, y) => {
            x = Math.max(0, Math.min(w - 1, x));
            y = Math.max(0, Math.min(h - 1, y));
            return copy[(y * w + x) * 4];
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let sum = 0;
                let count = 0;

                for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                        sum += get(x + kx, y + ky);
                        count++;
                    }
                }

                const mean = sum / count;
                const p = (y * w + x) * 4;
                const val = copy[p] < mean - C ? 0 : 255;

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    binarizeAdaptive(w, h, data, blockSize = 15, C = 5) {
        // blockSize должен быть нечётным
        if ((blockSize & 1) === 0) blockSize++;

        const half = blockSize >> 1;
        const size = w * h;

        // интегральное изображение
        const integral = new Uint32Array((w + 1) * (h + 1));

        // строим integral image
        for (let y = 1; y <= h; y++) {
            let rowSum = 0;

            for (let x = 1; x <= w; x++) {
                const p = ((y - 1) * w + (x - 1)) * 4;
                const gray = data[p];

                rowSum += gray;

                const idx = y * (w + 1) + x;
                integral[idx] = integral[idx - (w + 1)] + rowSum;
            }
        }

        // бинаризация
        for (let y = 0; y < h; y++) {
            const y1 = Math.max(0, y - half);
            const y2 = Math.min(h - 1, y + half);

            for (let x = 0; x < w; x++) {
                const x1 = Math.max(0, x - half);
                const x2 = Math.min(w - 1, x + half);

                const A = integral[y1 * (w + 1) + x1];
                const B = integral[y1 * (w + 1) + (x2 + 1)];
                const C2 = integral[(y2 + 1) * (w + 1) + x1];
                const D = integral[(y2 + 1) * (w + 1) + (x2 + 1)];

                const sum = D - B - C2 + A;
                const area = (x2 - x1 + 1) * (y2 - y1 + 1);
                const mean = sum / area;

                const p = (y * w + x) * 4;
                const val = data[p] < mean - C ? 0 : 255;

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    enhanceLocalContrastFast(w, h, data, radius = 7, strength = 2.0) {

        const gray = new Float32Array(w * h);

        // берем grayscale
        for (let i = 0; i < w * h; i++) {
            gray[i] = data[i * 4];
        }

        // integral image
        const integral = new Float32Array((w + 1) * (h + 1));

        for (let y = 1; y <= h; y++) {
            let rowSum = 0;

            for (let x = 1; x <= w; x++) {
                rowSum += gray[(y - 1) * w + (x - 1)];

                const idx = y * (w + 1) + x;
                integral[idx] =
                    integral[idx - (w + 1)] + rowSum;
            }
        }

        const getSum = (x0, y0, x1, y1) => {
            const W = w + 1;

            return (
                integral[y1 * W + x1] -
                integral[y0 * W + x1] -
                integral[y1 * W + x0] +
                integral[y0 * W + x0]
            );
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let x0 = x - radius;
                let y0 = y - radius;
                let x1 = x + radius;
                let y1 = y + radius;

                if (x0 < 0) x0 = 0;
                if (y0 < 0) y0 = 0;
                if (x1 >= w) x1 = w - 1;
                if (y1 >= h) y1 = h - 1;

                // integral координаты +1
                const sum = getSum(
                    x0, y0,
                    x1 + 1, y1 + 1
                );

                const area =
                    (x1 - x0 + 1) *
                    (y1 - y0 + 1);

                const mean = sum / area;

                const i = y * w + x;
                const p = i * 4;

                const v = gray[i];

                let val = v + (v - mean) * strength;

                if (val < 0) val = 0;
                if (val > 255) val = 255;

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    enhanceLocalContrastRGB(w, h, data, radius = 7, strength = 1.8) {

        const size = w * h;

        const r = new Float32Array(size);
        const g = new Float32Array(size);
        const b = new Float32Array(size);

        for (let i = 0; i < size; i++) {
            const p = i * 4;
            r[i] = data[p];
            g[i] = data[p + 1];
            b[i] = data[p + 2];
        }

        const W = w + 1;
        const H = h + 1;

        const intR = new Float32Array(W * H);
        const intG = new Float32Array(W * H);
        const intB = new Float32Array(W * H);

        // integral image
        for (let y = 1; y <= h; y++) {

            let sumR = 0;
            let sumG = 0;
            let sumB = 0;

            for (let x = 1; x <= w; x++) {

                const i = (y - 1) * w + (x - 1);

                sumR += r[i];
                sumG += g[i];
                sumB += b[i];

                const idx = y * W + x;

                intR[idx] = intR[idx - W] + sumR;
                intG[idx] = intG[idx - W] + sumG;
                intB[idx] = intB[idx - W] + sumB;
            }
        }

        const getSum = (int, x0, y0, x1, y1) =>
            int[y1 * W + x1] -
            int[y0 * W + x1] -
            int[y1 * W + x0] +
            int[y0 * W + x0];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let x0 = x - radius;
                let y0 = y - radius;
                let x1 = x + radius;
                let y1 = y + radius;

                if (x0 < 0) x0 = 0;
                if (y0 < 0) y0 = 0;
                if (x1 >= w) x1 = w - 1;
                if (y1 >= h) y1 = h - 1;

                const area =
                    (x1 - x0 + 1) *
                    (y1 - y0 + 1);

                const sr = getSum(intR, x0, y0, x1 + 1, y1 + 1);
                const sg = getSum(intG, x0, y0, x1 + 1, y1 + 1);
                const sb = getSum(intB, x0, y0, x1 + 1, y1 + 1);

                const meanR = sr / area;
                const meanG = sg / area;
                const meanB = sb / area;

                const p = (y * w + x) * 4;

                let vr = r[y * w + x] + (r[y * w + x] - meanR) * strength;
                let vg = g[y * w + x] + (g[y * w + x] - meanG) * strength;
                let vb = b[y * w + x] + (b[y * w + x] - meanB) * strength;

                if (vr < 0) vr = 0;
                if (vg < 0) vg = 0;
                if (vb < 0) vb = 0;

                if (vr > 255) vr = 255;
                if (vg > 255) vg = 255;
                if (vb > 255) vb = 255;

                data[p] = vr;
                data[p + 1] = vg;
                data[p + 2] = vb;
            }
        }
    }
    removeNoise2(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0 || y < 0 || x >= w || y >= h) return 255;
            return copy[(y * w + x) * 4];
        };

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                let black = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        if (get(x + kx, y + ky) === 0) black++;
                    }
                }

                const p = (y * w + x) * 4;
                const val = black >= 3 ? 0 : 255;

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    removeNoise(w, h, data, radius = 1, threshold = 6, passes = 1) {
        const size = radius * 2 + 1;
        const area = size * size;

        for (let pass = 0; pass < passes; pass++) {

            const copy = new Uint8ClampedArray(data);

            const get = (x, y) => {
                if (x < 0 || y < 0 || x >= w || y >= h) return 255;
                return copy[(y * w + x) * 4];
            };

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {

                    let black = 0;

                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            if (get(x + kx, y + ky) === 0) black++;
                        }
                    }

                    const p = (y * w + x) * 4;

                    const val =
                        black >= threshold ? 0 : 255;

                    data[p] = val;
                    data[p + 1] = val;
                    data[p + 2] = val;
                }
            }
        }
    }
    medianFilter(w, h, data, radius = 1, passes = 2) {
        const size = radius * 2 + 1;
        const area = size * size;

        for (let pass = 0; pass < passes; pass++) {

            const copy = new Uint8ClampedArray(data);

            const get = (x, y) => {
                if (x < 0) x = 0;
                else if (x >= w) x = w - 1;

                if (y < 0) y = 0;
                else if (y >= h) y = h - 1;

                return copy[(y * w + x) * 4];
            };

            const window = new Uint8Array(area);

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {

                    let i = 0;

                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            window[i++] = get(x + kx, y + ky);
                        }
                    }

                    window.sort();

                    const median = window[area >> 1];
                    const p = (y * w + x) * 4;

                    data[p] = median;
                    data[p + 1] = median;
                    data[p + 2] = median;
                }
            }
        }
    }
    removeSmallComponents(w, h, data, minPixels = 60) {
        const visited = new Uint8Array(w * h);
        const stack = [];

        const isBlack = (x, y) => data[(y * w + x) * 4] === 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                const id = y * w + x;
                if (visited[id]) continue;
                if (!isBlack(x, y)) continue;

                let pixels = [];
                stack.push([x, y]);
                visited[id] = 1;

                while (stack.length) {
                    const [cx, cy] = stack.pop();
                    pixels.push([cx, cy]);

                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {

                            const nx = cx + kx;
                            const ny = cy + ky;

                            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

                            const nid = ny * w + nx;
                            if (visited[nid]) continue;
                            if (!isBlack(nx, ny)) continue;

                            visited[nid] = 1;
                            stack.push([nx, ny]);
                        }
                    }
                }

                if (pixels.length < minPixels) {
                    for (const [px, py] of pixels) {
                        const p = (py * w + px) * 4;
                        data[p] = 255;
                        data[p + 1] = 255;
                        data[p + 2] = 255;
                    }
                }
            }
        }
    }
    erode2(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0 || y < 0 || x >= w || y >= h) return 255;
            return copy[(y * w + x) * 4];
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let min = 255;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        min = Math.min(min, get(x + kx, y + ky));
                    }
                }

                const p = (y * w + x) * 4;
                data[p] = min;
                data[p + 1] = min;
                data[p + 2] = min;
            }
        }
    }
    erode(w, h, data, radius = 1, passes = 1) {
        for (let pass = 0; pass < passes; pass++) {

            const copy = new Uint8ClampedArray(data);
            const size = radius * 2 + 1;

            const get = (x, y) => {
                if (x < 0 || y < 0 || x >= w || y >= h) return 255;
                return copy[(y * w + x) * 4];
            };

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {

                    let min = 255;

                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            const v = get(x + kx, y + ky);
                            if (v < min) min = v;
                        }
                    }

                    const p = (y * w + x) * 4;
                    data[p] = min;
                    data[p + 1] = min;
                    data[p + 2] = min;
                }
            }
        }
    }
    dilate2(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0 || y < 0 || x >= w || y >= h) return 0;
            return copy[(y * w + x) * 4];
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let max = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        max = Math.max(max, get(x + kx, y + ky));
                    }
                }

                const p = (y * w + x) * 4;
                data[p] = max;
                data[p + 1] = max;
                data[p + 2] = max;
            }
        }
    }
    dilate(w, h, data, radius = 1, passes = 2) {
        for (let pass = 0; pass < passes; pass++) {

            const copy = new Uint8ClampedArray(data);

            const get = (x, y) => {
                if (x < 0 || y < 0 || x >= w || y >= h) return 0;
                return copy[(y * w + x) * 4];
            };

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {

                    let max = 0;

                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            const v = get(x + kx, y + ky);
                            if (v > max) max = v;
                        }
                    }

                    const p = (y * w + x) * 4;

                    data[p] = max;
                    data[p + 1] = max;
                    data[p + 2] = max;
                }
            }
        }
    }
    findCharacters3(w, h, data) {
        const visited = new Uint8Array(w * h);
        const boxes = [];

        const isBlack = (x, y) => data[(y * w + x) * 4] === 0;

        const flood = (sx, sy) => {
            const stack = [[sx, sy]];
            let minX = sx, maxX = sx, minY = sy, maxY = sy;
            let count = 0;

            while (stack.length) {
                const [x, y] = stack.pop();
                if (x < 0 || y < 0 || x >= w || y >= h) continue;

                const idx = y * w + x;
                if (visited[idx] || !isBlack(x, y)) continue;

                visited[idx] = 1;
                count++;

                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);

                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }

            if (count < 20) return null;

            return {
                x: minX,
                y: minY,
                w: maxX - minX + 1,
                h: maxY - minY + 1
            };
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                if (!visited[idx] && isBlack(x, y)) {
                    const box = flood(x, y);
                    if (box) boxes.push(box);
                }
            }
        }

        boxes.sort((a, b) => a.x - b.x);
        return boxes;
    }
    findCharacters2(w, h, data) {
        const visited = new Uint8Array(w * h);
        const boxes = [];

        const isBlack = (x, y) => data[(y * w + x) * 4] === 0;

        const flood = (sx, sy) => {
            const stack = [[sx, sy]];
            let minX = sx, maxX = sx, minY = sy, maxY = sy;
            let pixels = 0;

            while (stack.length) {
                const [x, y] = stack.pop();
                if (x < 0 || y < 0 || x >= w || y >= h) continue;

                const idx = y * w + x;
                if (visited[idx] || !isBlack(x, y)) continue;

                visited[idx] = 1;
                pixels++;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }

            if (pixels < 25) return null;

            const box = {
                x: minX,
                y: minY,
                w: maxX - minX + 1,
                h: maxY - minY + 1,
                pixels
            };

            const area = box.w * box.h;
            const aspect = box.w / box.h;
            const density = pixels / area;

            if (
                area < 120 ||
                box.h < 14 ||
                box.w < 4 ||
                box.h > h * 0.5 ||
                aspect > 6 ||
                aspect < 0.15 ||
                density < 0.08
            ) {
                return null;
            }

            return box;
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                if (!visited[idx] && isBlack(x, y)) {
                    const box = flood(x, y);
                    if (box) boxes.push(box);
                }
            }
        }

        // удаляем вложенные боксы (часто шум внутри символа)
        const filtered = [];
        for (let i = 0; i < boxes.length; i++) {
            let inside = false;
            for (let j = 0; j < boxes.length; j++) {
                if (i === j) continue;

                const a = boxes[i];
                const b = boxes[j];

                if (
                    a.x >= b.x &&
                    a.y >= b.y &&
                    a.x + a.w <= b.x + b.w &&
                    a.y + a.h <= b.y + b.h
                ) {
                    inside = true;
                    break;
                }
            }
            if (!inside) filtered.push(boxes[i]);
        }

        filtered.sort((a, b) => {
            const dy = Math.abs(a.y - b.y);
            if (dy > 20) return a.y - b.y;
            return a.x - b.x;
        });

        return filtered;
    }
    findCharacters12(w, h, data, minSize = 512) {
        const visited = new Uint8Array(w * h);
        const boxes = [];

        const isBlack = (x, y) => {
            const p = (y * w + x) * 4;
            return data[p] === 0;
        };

        const stack = [];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                const id = y * w + x;
                if (visited[id]) continue;
                if (!isBlack(x, y)) continue;

                let minX = x;
                let minY = y;
                let maxX = x;
                let maxY = y;
                let count = 0;

                stack.push([x, y]);
                visited[id] = 1;

                while (stack.length) {
                    const [cx, cy] = stack.pop();
                    count++;

                    if (cx < minX) minX = cx;
                    if (cy < minY) minY = cy;
                    if (cx > maxX) maxX = cx;
                    if (cy > maxY) maxY = cy;

                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const nx = cx + kx;
                            const ny = cy + ky;

                            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

                            const nid = ny * w + nx;
                            if (visited[nid]) continue;
                            if (!isBlack(nx, ny)) continue;

                            visited[nid] = 1;
                            stack.push([nx, ny]);
                        }
                    }
                }

                const bw = maxX - minX + 1;
                const bh = maxY - minY + 1;

                if (count >= minSize && bw > 2 && bh > 5) {
                    boxes.push({
                        x: minX,
                        y: minY,
                        w: bw,
                        h: bh,
                        pixels: count
                    });
                }
            }
        }

        return boxes;
    }
    findCharacters8(w, h, data, options = {}) {
        const {
            minPixels = 25,
            minWidth = 3,
            minHeight = 6,
            maxRatio = 16,
            minRatio = 9,
            mergeGap = 0
        } = options;

        const visited = new Uint8Array(w * h);
        const boxes = [];
        const stack = [];

        const isBlack = (x, y) => {
            const p = (y * w + x) * 4;
            return data[p] === 0;
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                const id = y * w + x;
                if (visited[id]) continue;
                if (!isBlack(x, y)) continue;

                let minX = x, minY = y, maxX = x, maxY = y;
                let pixels = 0;

                stack.push([x, y]);
                visited[id] = 1;

                while (stack.length) {
                    const [cx, cy] = stack.pop();
                    pixels++;

                    if (cx < minX) minX = cx;
                    if (cy < minY) minY = cy;
                    if (cx > maxX) maxX = cx;
                    if (cy > maxY) maxY = cy;

                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {

                            const nx = cx + kx;
                            const ny = cy + ky;

                            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

                            const nid = ny * w + nx;
                            if (visited[nid]) continue;
                            if (!isBlack(nx, ny)) continue;

                            visited[nid] = 1;
                            stack.push([nx, ny]);
                        }
                    }
                }

                const bw = maxX - minX + 1;
                const bh = maxY - minY + 1;
                const ratio = bw / bh;

                if (
                    //pixels >= minPixels &&
                    //bw >= minWidth &&
                    //bh >= minHeight &&
                    ratio > minRatio &&
                    ratio < maxRatio
                ) {
                    boxes.push({
                        x: minX,
                        y: minY,
                        w: bw,
                        h: bh,
                        pixels
                    });
                }
            }
        }

        // объединение близких частей символов
        const merged = [];
        for (const box of boxes) {
            let mergedFlag = false;

            for (const m of merged) {
                const dx = Math.abs((box.x + box.w / 2) - (m.x + m.w / 2));
                const dy = Math.abs((box.y + box.h / 2) - (m.y + m.h / 2));

                if (dx < mergeGap + m.w && dy < mergeGap + m.h) {
                    const minX = Math.min(m.x, box.x);
                    const minY = Math.min(m.y, box.y);
                    const maxX = Math.max(m.x + m.w, box.x + box.w);
                    const maxY = Math.max(m.y + m.h, box.y + box.h);

                    m.x = minX;
                    m.y = minY;
                    m.w = maxX - minX;
                    m.h = maxY - minY;

                    mergedFlag = true;
                    break;
                }
            }

            if (!mergedFlag) {
                merged.push({ ...box });
            }
        }

        // сортировка как текст
        merged.sort((a, b) => {
            const lineThreshold = 10;

            if (Math.abs(a.y - b.y) < lineThreshold) {
                return a.x - b.x;
            }

            return a.y - b.y;
        });

        return merged;
    }
    findNumberBoxes2(w, h, data) {
        const visited = new Uint8Array(w * h);
        const boxes = [];

        const isWhite = (x, y) => {
            const p = (y * w + x) * 4;
            return data[p] > 200;
        };

        const stack = [];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                const idx = y * w + x;
                if (visited[idx]) continue;
                if (!isWhite(x, y)) continue;

                let minX = x, maxX = x;
                let minY = y, maxY = y;

                stack.length = 0;
                stack.push(idx);
                visited[idx] = 1;

                while (stack.length) {
                    const i = stack.pop();
                    const cx = i % w;
                    const cy = (i / w) | 0;

                    if (cx < minX) minX = cx;
                    if (cx > maxX) maxX = cx;
                    if (cy < minY) minY = cy;
                    if (cy > maxY) maxY = cy;

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = cx + dx;
                            const ny = cy + dy;

                            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

                            const ni = ny * w + nx;
                            if (visited[ni]) continue;
                            if (!isWhite(nx, ny)) continue;

                            visited[ni] = 1;
                            stack.push(ni);
                        }
                    }
                }

                const bw = maxX - minX + 1;
                const bh = maxY - minY + 1;

                // фильтр боксов чисел
                if (
                    //true
                    //bw > 80 &&
                    bw < w * 0.6 &&
                    bh > 35 &&
                    //bh < 120 &&
                    bw / bh > 2.0
                ) {
                    boxes.push({
                        x: minX,
                        y: minY,
                        w: bw,
                        h: bh
                    });
                }
            }
        }

        // сортировка сверху вниз
        boxes.sort((a, b) => a.y - b.y);

        return boxes;
    }
    findNumberBoxes3(rows, w, h, data) {
        const boxes = [];

        for (const r of rows) {
            let minX = w;
            let maxX = 0;

            for (let y = r.y; y < r.y + r.h; y++) {
                for (let x = (w * 0.45) | 0; x < w; x++) {
                    const p = (y * w + x) * 4;

                    if (data[p] < 200) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                    }
                }
            }

            if (maxX > minX) {
                boxes.push({
                    x: minX,
                    y: r.y,
                    w: maxX - minX,
                    h: r.h
                });
            }
        }

        return boxes;
    }
    findNumberBoxes(rows, w, h, data) {
        const boxes = [];

        for (const r of rows) {

            let minX = w;
            let maxX = 0;

            const scanStart = (w * 0.35) | 0;
            const scanEnd = (w * 0.8) | 0;

            for (let y = r.y; y < r.y + r.h; y++) {
                for (let x = scanStart; x < scanEnd; x++) {
                    const p = (y * w + x) * 4;

                    if (data[p] < 180) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                    }
                }
            }

            if (maxX - minX > w * 0.05) {
                boxes.push({
                    x: minX,
                    y: r.y,
                    w: maxX - minX,
                    h: r.h
                });
            }
        }

        return boxes;
    }
    splitLines(boxes) {
        const lines = [];

        boxes.forEach(box => {
            let placed = false;

            for (const line of lines) {
                const dy = Math.abs(line.y - box.y);
                if (dy < box.h) {
                    line.boxes.push(box);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                lines.push({
                    y: box.y,
                    boxes: [box]
                });
            }
        });

        lines.forEach(line => line.boxes.sort((a, b) => a.x - b.x));
        return lines;
    }
    normalizeGlyph(w, h, data, box, size = 20) {
        const out = new Uint8Array(size * size);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const sx = box.x + Math.floor(x * box.w / size);
                const sy = box.y + Math.floor(y * box.h / size);

                const p = (sy * w + sx) * 4;
                const v = data[p] === 0 ? 1 : 0;

                out[y * size + x] = v;
            }
        }

        return out;
    }
    sauvolaBinarize(w, h, data, windowSize = 31, k = 0.34, R = 128) {
        const gray = new Uint8Array(w * h);

        // взять grayscale из RGBA
        for (let i = 0; i < w * h; i++) {
            gray[i] = data[i * 4];
        }

        const half = (windowSize / 2) | 0;

        const get = (x, y) => {
            if (x < 0) x = 0;
            else if (x >= w) x = w - 1;

            if (y < 0) y = 0;
            else if (y >= h) y = h - 1;

            return gray[y * w + x];
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let sum = 0;
                let sumSq = 0;
                let count = 0;

                for (let ky = -half; ky <= half; ky++) {
                    for (let kx = -half; kx <= half; kx++) {
                        const v = get(x + kx, y + ky);
                        sum += v;
                        sumSq += v * v;
                        count++;
                    }
                }

                const mean = sum / count;
                const variance = sumSq / count - mean * mean;
                const std = Math.sqrt(Math.max(variance, 0));

                const threshold = mean * (1 + k * (std / R - 1));

                const p = (y * w + x) * 4;
                const val = gray[y * w + x] < threshold ? 0 : 255;

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    sauvolaBinarizeFast(w, h, data, windowSize = 31, k = 0.34, R = 128) {

        const size = w * h;
        const gray = new Float32Array(size);

        for (let i = 0; i < size; i++) {
            gray[i] = data[i * 4];
        }

        const W = w + 1;
        const H = h + 1;

        const integral = new Float32Array(W * H);
        const integralSq = new Float32Array(W * H);

        // build integral images
        for (let y = 1; y <= h; y++) {

            let rowSum = 0;
            let rowSumSq = 0;

            for (let x = 1; x <= w; x++) {

                const v = gray[(y - 1) * w + (x - 1)];

                rowSum += v;
                rowSumSq += v * v;

                const idx = y * W + x;

                integral[idx] =
                    integral[idx - W] + rowSum;

                integralSq[idx] =
                    integralSq[idx - W] + rowSumSq;
            }
        }

        const getSum = (int, x0, y0, x1, y1) =>
            int[y1 * W + x1] -
            int[y0 * W + x1] -
            int[y1 * W + x0] +
            int[y0 * W + x0];

        const half = (windowSize / 2) | 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let x0 = x - half;
                let y0 = y - half;
                let x1 = x + half;
                let y1 = y + half;

                if (x0 < 0) x0 = 0;
                if (y0 < 0) y0 = 0;
                if (x1 >= w) x1 = w - 1;
                if (y1 >= h) y1 = h - 1;

                const area =
                    (x1 - x0 + 1) *
                    (y1 - y0 + 1);

                const sum = getSum(integral, x0, y0, x1 + 1, y1 + 1);
                const sumSq = getSum(integralSq, x0, y0, x1 + 1, y1 + 1);

                const mean = sum / area;
                const variance = sumSq / area - mean * mean;
                const std = Math.sqrt(Math.max(variance, 0));

                const threshold = mean * (1 + k * (std / R - 1));

                const i = y * w + x;
                const p = i * 4;

                const val = gray[i] < threshold ? 0 : 255;

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    findLabelBoxes2(numberBoxes, w, h, data) {
        const labels = [];

        for (const nb of numberBoxes) {

            const y1 = nb.y;
            const y2 = nb.y + nb.h;

            let minX = w;
            let maxX = 0;

            for (let y = y1; y < y2; y++) {
                for (let x = 0; x < nb.x - 10; x++) {
                    const p = (y * w + x) * 4;

                    if (data[p] < 200) { // тёмный пиксель
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                    }
                }
            }

            if (maxX > minX) {
                labels.push({
                    x: minX,
                    y: y1,
                    w: maxX - minX,
                    h: nb.h
                });
            }
        }

        return labels;
    }
    findLabelBoxes(numberBoxes, w, h, data) {
        const labels = [];

        for (const nb of numberBoxes) {

            let minX = w;
            let maxX = 0;

            for (let y = nb.y; y < nb.y + nb.h; y++) {
                for (let x = 0; x < nb.x - w * 0.05; x++) {

                    const p = (y * w + x) * 4;

                    if (data[p] < 200) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                    }
                }
            }

            if (maxX > minX) {
                labels.push({
                    x: minX,
                    y: nb.y,
                    w: maxX - minX,
                    h: nb.h
                });
            }
        }

        return labels;
    }
    findGreenBox2(w, h, data) {
        let minX = w, minY = h;
        let maxX = 0, maxY = 0;

        for (let i = 0; i < w * h; i++) {
            const p = i * 4;

            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];

            if (
                g > 150 &&
                r < 120 &&
                b < 120
            ) {
                const x = i % w;
                const y = (i / w) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        return [{
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY
        }];
    }
    findGreenBox3(w, h, data) {
        let minX = w, minY = h;
        let maxX = 0, maxY = 0;

        for (let i = 0; i < w * h; i++) {
            const p = i * 4;

            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];

            if (
                g > r + 40 &&
                g > b + 40 &&
                g > 120
            ) {
                const x = i % w;
                const y = (i / w) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        if (maxX <= minX) return null;

        return [{
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY
        }];
    }
    findGreenBox(w, h, data) {
        let minX = w, minY = h;
        let maxX = 0, maxY = 0;

        const startX = (w * 0.7) | 0;

        for (let y = 0; y < h; y++) {
            for (let x = startX; x < w; x++) {
                const p = (y * w + x) * 4;

                const r = data[p];
                const g = data[p + 1];
                const b = data[p + 2];

                if (g > 140 && g > r + 40 && g > b + 40) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (maxX <= minX) return null;

        return [{
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY
        }];
    }
    findRows2(w, h, data) {
        const rows = [];

        const density = new Float32Array(h);

        for (let y = 0; y < h; y++) {
            let count = 0;

            for (let x = 0; x < w; x++) {
                const p = (y * w + x) * 4;

                if (data[p] < 200) count++;
            }

            density[y] = count / w;
        }

        const threshold = 0.02;

        let start = -1;

        for (let y = 0; y < h; y++) {
            if (density[y] > threshold) {
                if (start === -1) start = y;
            } else {
                if (start !== -1) {
                    rows.push({ y: start, h: y - start });
                    start = -1;
                }
            }
        }

        return rows.filter(r => r.h > h * 0.02);
    }
    cropUIArea(rows, h) {
        return rows.filter(r => r.y < h * 0.75);
    }
    findTableRows(w, h, data) {
        const rows = [];

        const density = new Float32Array(h);

        for (let y = 0; y < h; y++) {
            let count = 0;

            for (let x = 0; x < w; x++) {
                const p = (y * w + x) * 4;
                if (data[p] < 180) count++;
            }

            density[y] = count / w;
        }

        let start = -1;

        for (let y = 0; y < h; y++) {
            if (density[y] > 0.015) {
                if (start === -1) start = y;
            } else {
                if (start !== -1) {
                    const height = y - start;

                    if (
                        height > h * 0.025 &&
                        height < h * 0.12
                    ) {
                        rows.push({ y: start, h: height });
                    }

                    start = -1;
                }
            }
        }

        return this.cropUIArea(rows, h);
    }
    detectRows3(w, h, data) {
        const rows = [];
        const projection = new Uint32Array(h);

        for (let y = 0; y < h; y++) {
            let sum = 0;
            for (let x = 0; x < w; x++) {
                const p = (y * w + x) * 4;
                if (data[p] === 0) sum++;
            }
            projection[y] = sum;
        }

        const threshold = w * 0.15;

        let start = -1;

        for (let y = 0; y < h; y++) {
            if (projection[y] > threshold) {
                if (start === -1) start = y;
            } else {
                if (start !== -1) {
                    rows.push({ y: start, h: y - start });
                    start = -1;
                }
            }
        }
        return { rows, projection };
    }
    detectRows4(w, h, data) {
        const rows = [];
        const projection = new Uint32Array(h);

        for (let y = 0; y < h; y++) {
            let sum = 0;
            for (let x = 0; x < w; x++) {
                const p = (y * w + x) * 4;
                if (data[p] === 0) sum++;
            }
            projection[y] = sum;
        }

        const threshold = w * 0.3;

        let start = -1;

        for (let y = 0; y < h; y++) {
            if (projection[y] > threshold) {
                if (start === -1) start = y;
            } else {
                if (start !== -1) {
                    rows.push({ y: start, h: y - start });
                    start = -1;
                }
            }
        }

        return { rows, projection, threshold };
    }
    detectRows(w, h, data) {
        const rows = [];
        const projection = new Uint32Array(h);

        for (let y = 0; y < h; y++) {
            let sum = 0;
            for (let x = 0; x < w; x++) {
                const p = (y * w + x) * 4;
                if (data[p] === 0) sum++;
            }
            projection[y] = sum;
        }

        const threshold = w * 0.05;
        const minHeight = h * 0.025;

        let start = -1;

        for (let y = 0; y < h; y++) {
            if (projection[y] > threshold) {
                if (start === -1) start = y;
            } else {
                if (start !== -1) {
                    const height = y - start;
                    if (height > minHeight) {
                        rows.push({ y: start, h: height });
                    }
                    start = -1;
                }
            }
        }
        return { rows, projection, threshold };
    }
    drawRows(ctx, rows, w) {
        ctx.save();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;

        for (const row of rows) {
            ctx.strokeRect(0, row.y, w, row.h);
        }

        ctx.restore();
    }
    drawProjection2(ctx, projection, w, h) {
        ctx.save();
        ctx.globalAlpha = 0.5;

        for (let y = 0; y < h; y++) {
            const v = projection[y] / w;
            const width = v * w;
            ctx.fillRect(0, y, width, 1);
        }

        ctx.restore();
    }
    drawProjection(ctx, projection, w, h, threshold = 0) {
        ctx.save();

        const max = Math.max(...projection);

        for (let y = 0; y < h; y++) {
            const v = projection[y] / max;
            const width = v * w;

            ctx.fillStyle = "rgba(0,0,255,0.4)";
            ctx.fillRect(0, y, width, 1);
        }

        // линия порога
        if (threshold > 0) {
            const t = threshold / max * w;
            ctx.fillStyle = "red";
            ctx.fillRect(t, 0, 2, h);
        }

        ctx.restore();
    }
    detectHorizontalLines(w, h, data) {
        const lines = [];

        const minLength = w * 0.35;   // линия должна быть длинной
        const thickness = 512;          // допускаем толщину линии

        for (let y = 0; y < h; y++) {
            let runStart = -1;
            let runLength = 0;

            for (let x = 0; x < w; x++) {
                const p = (y * w + x) * 4;
                const v = data[p];

                const isLine = v === 0;

                if (isLine) {
                    if (runStart === -1) runStart = x;
                    runLength++;
                } else {
                    if (runLength > minLength) {
                        lines.push({
                            x: runStart,
                            y: y,
                            w: runLength,
                            h: thickness
                        });
                    }
                    runStart = -1;
                    runLength = 0;
                }
            }

            if (runLength > minLength) {
                lines.push({
                    x: runStart,
                    y: y,
                    w: runLength,
                    h: thickness
                });
            }
        }
        return this.mergeLines(lines);
    }
    mergeLines(lines) {
        const merged = [];

        for (const line of lines) {
            let found = false;

            for (const m of merged) {
                if (Math.abs(line.y - m.y) < 4) {
                    m.y = (m.y + line.y) / 2;
                    m.w = Math.max(m.w, line.w);
                    found = true;
                    break;
                }
            }

            if (!found) merged.push({ ...line });
        }

        return merged;
    }
    drawLines(ctx, lines) {
        ctx.save();
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;

        for (const l of lines) {
            ctx.strokeRect(l.x, l.y, l.w, 2);
        }

        ctx.restore();
    }
    vectorize3x3(w, h, data) {
        const vectors = new Float32Array(w * h * 2);

        const gray = (i) => {
            return (data[i] + data[i + 1] + data[i + 2]) / 3;
        };

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                const p = (y * w + x) * 4;

                let same = true;
                const c = gray(p);

                // проверяем 3x3 одинаковость
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pp = ((y + ky) * w + (x + kx)) * 4;
                        const g = gray(pp);
                        if (Math.abs(g - c) > 8) {
                            same = false;
                            break;
                        }
                    }
                    if (!same) break;
                }

                const id = (y * w + x) * 2;

                if (same) {
                    vectors[id] = 0;
                    vectors[id + 1] = 0;
                    continue;
                }

                // направление изменения
                const left = gray((y * w + (x - 1)) * 4);
                const right = gray((y * w + (x + 1)) * 4);
                const top = gray(((y - 1) * w + x) * 4);
                const bottom = gray(((y + 1) * w + x) * 4);

                const dx = right - left;
                const dy = bottom - top;

                vectors[id] = dx;
                vectors[id + 1] = dy;
            }
        }

        return vectors;
    }
    drawVectors(ctx, vectors, w, h, step = 6) {
        ctx.save();
        ctx.strokeStyle = "red";

        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {

                const id = (y * w + x) * 2;
                const dx = vectors[id];
                const dy = vectors[id + 1];

                if (dx === 0 && dy === 0) continue;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + dx * 0.2, y + dy * 0.2);
                ctx.stroke();
            }
        }

        ctx.restore();
    }
    gradientMagnitude(w, h, data) {
        const gray = new Uint8Array(w * h);

        //перевод в grayscale
        for (let i = 0; i < w * h; i++) {
            const p = i * 4;
            gray[i] = (data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114) | 0;
        }

        const out = new Uint8Array(w * h);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return gray[y * w + x];
        };

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                const gx =
                    -get(x - 1, y - 1) + get(x + 1, y - 1) +
                    -2 * get(x - 1, y) + 2 * get(x + 1, y) +
                    -get(x - 1, y + 1) + get(x + 1, y + 1);

                const gy =
                    -get(x - 1, y - 1) - 2 * get(x, y - 1) - get(x + 1, y - 1) +
                    get(x - 1, y + 1) + 2 * get(x, y + 1) + get(x + 1, y + 1);

                const mag = Math.sqrt(gx * gx + gy * gy);

                out[y * w + x] = mag > 60 ? 0 : 255;
            }
        }

        // записываем обратно в imageData
        for (let i = 0; i < w * h; i++) {
            const v = out[i];
            const p = i * 4;
            data[p] = v;
            data[p + 1] = v;
            data[p + 2] = v;
        }
    }
    gradientImage2(w, h, data) {
        const gray = new Float32Array(w * h);

        // grayscale
        for (let i = 0; i < w * h; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        const out = new Float32Array(w * h);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return gray[y * w + x];
        };

        let maxMag = 0;

        // Sobel
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                const gx =
                    -get(x - 1, y - 1) + get(x + 1, y - 1) +
                    -2 * get(x - 1, y) + 2 * get(x + 1, y) +
                    -get(x - 1, y + 1) + get(x + 1, y + 1);

                const gy =
                    -get(x - 1, y - 1) - 2 * get(x, y - 1) - get(x + 1, y - 1) +
                    get(x - 1, y + 1) + 2 * get(x, y + 1) + get(x + 1, y + 1);

                const mag = Math.sqrt(gx * gx + gy * gy);
                out[y * w + x] = mag;

                if (mag > maxMag) maxMag = mag;
            }
        }

        // нормализация в 0–255
        const scale = 255 / (maxMag || 1);

        for (let i = 0; i < w * h; i++) {
            const v = Math.min(255, out[i] * scale) | 0;
            const p = i * 4;
            data[p] = v;
            data[p + 1] = v;
            data[p + 2] = v;
        }
    }
    gradientImage(w, h, data) {
        const gray = new Float32Array(w * h);

        // уже grayscale — берем один канал
        for (let i = 0; i < w * h; i++) {
            gray[i] = data[i * 4];
        }

        const out = new Float32Array(w * h);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return gray[y * w + x];
        };

        let maxMag = 0;

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                const gx =
                    -get(x - 1, y - 1) + get(x + 1, y - 1) +
                    -2 * get(x - 1, y) + 2 * get(x + 1, y) +
                    -get(x - 1, y + 1) + get(x + 1, y + 1);

                const gy =
                    -get(x - 1, y - 1) - 2 * get(x, y - 1) - get(x + 1, y - 1) +
                    get(x - 1, y + 1) + 2 * get(x, y + 1) + get(x + 1, y + 1);




                const mag = Math.sqrt(gx * gx + gy * gy);
                const threshold = 40 + (gray[y * w + x] * 0.2);
                out[y * w + x] = mag > threshold ? 0 : 255;
                //out[y * w + x] = mag;

                if (mag > maxMag) maxMag = mag;
            }
        }

        const scale = 255 / (maxMag || 1);

        for (let i = 0; i < w * h; i++) {
            const v = (out[i] * scale) | 0;
            const p = i * 4;

            data[p] = v;
            data[p + 1] = v;
            data[p + 2] = v;
        }
    }
    mapCosineTo255Inverted(s) {
        return s < 100 ? 255 : 0;//Math.round(((1 - s) / 2) * 255);
    }
    scan4(w, h, data) {
        const changes = []; // массив изменений цвета
        // Проходим по всем пикселям
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // Для примера сравним с предыдущим пикселем слева
                if (x > 0) {
                    const prevIdx = (y * w + (x - 1)) * 4;
                    const r2 = data[prevIdx];
                    const g2 = data[prevIdx + 1];
                    const b2 = data[prevIdx + 2];

                    const diff = Math.sqrt(
                        (r - r2) ** 2 +
                        (g - g2) ** 2 +
                        (b - b2) ** 2
                    );

                    //changes.push(diff);

                    const dif = this.mapCosineTo255Inverted(diff);

                    data[prevIdx] = diff;
                    data[prevIdx + 1] = diff;
                    data[prevIdx + 2] = diff;

                    data[idx] = dif;
                    data[idx + 1] = dif;
                    data[idx + 2] = dif;

                }
            }
        }

        // Можно вернуть среднее изменение цвета
        //const total = changes.reduce((a, b) => a + b, 0);
        //return total / changes.length;
    }
    colorGradient(w, h, data) {
        const out = new Float32Array(w * h * 3);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            const p = (y * w + x) * 4;
            return [data[p], data[p + 1], data[p + 2]];
        };

        let maxVal = 0;

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                const L = get(x - 1, y);
                const R = get(x + 1, y);
                const T = get(x, y - 1);
                const B = get(x, y + 1);

                const dxR = R[0] - L[0];
                const dxG = R[1] - L[1];
                const dxB = R[2] - L[2];

                const dyR = B[0] - T[0];
                const dyG = B[1] - T[1];
                const dyB = B[2] - T[2];

                const r = Math.abs(dxR) + Math.abs(dyR);
                const g = Math.abs(dxG) + Math.abs(dyG);
                const b = Math.abs(dxB) + Math.abs(dyB);

                const id = (y * w + x) * 3;

                out[id] = r;
                out[id + 1] = g;
                out[id + 2] = b;

                if (r > maxVal) maxVal = r;
                if (g > maxVal) maxVal = g;
                if (b > maxVal) maxVal = b;
            }
        }

        const scale = 255 / (maxVal || 1);

        for (let i = 0; i < w * h; i++) {
            const p = i * 4;
            const id = i * 3;

            data[p] = out[id] * scale * 20;
            data[p + 1] = out[id + 1] * scale * 20;
            data[p + 2] = out[id + 2] * scale * 20;
        }
    }
    scan(w, h, data, ctx) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;

            const p = (y * w + x) * 4;
            return [
                copy[p],
                copy[p + 1],
                copy[p + 2]
            ];
        };

        const dist = (a, b) => {
            const dr = a[0] - b[0];
            const dg = a[1] - b[1];
            const db = a[2] - b[2];
            return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        ctx.lineWidth = 1;

        for (let y = 0; y < h - 1; y += 2) {
            for (let x = 0; x < w - 1; x += 2) {

                const c = get(x, y);
                const cx = get(x + 1, y);
                const cy = get(x, y + 1);

                const dx = dist(c, cx);
                const dy = dist(c, cy);

                const len = Math.sqrt(dx * dx + dy * dy);

                if (len < 60) continue; // фильтр слабых изменений

                const vx = dx / (len || 1);
                const vy = dy / (len || 1);

                const scale = 4;

                ctx.strokeStyle = "green";

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + vx * scale,
                    y + vy * scale
                );
                ctx.stroke();
            }
        }
    }
    detectOrthogonalLines(w, h, data) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;

            return copy[(y * w + x) * 4];
        };

        // ядра
        const kernelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];

        const kernelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let gx = 0;
                let gy = 0;
                let i = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = get(x + kx, y + ky);
                        gx += v * kernelX[i];
                        gy += v * kernelY[i];
                        i++;
                    }
                }

                const mag = Math.sqrt(gx * gx + gy * gy);

                const p = (y * w + x) * 4;
                const val = Math.min(255, mag);

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    detectOrthogonalLinesAndDraw(ctx, w, h, data, threshold = 40) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return copy[(y * w + x) * 4];
        };

        const kernelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];

        const kernelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];

        const verticalLines = [];
        const horizontalLines = [];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                let gx = 0;
                let gy = 0;
                let i = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = get(x + kx, y + ky);
                        gx += v * kernelX[i];
                        gy += v * kernelY[i];
                        i++;
                    }
                }

                const mag = Math.sqrt(gx * gx + gy * gy);

                if (mag > threshold) {
                    const angle = Math.atan2(gy, gx);

                    // вертикальная линия
                    if (Math.abs(angle) < 0.4 || Math.abs(angle) > 2.7) {
                        verticalLines.push({ x, y });
                    }
                    // горизонтальная линия
                    else if (Math.abs(Math.abs(angle) - Math.PI / 2) < 10.04) {
                        horizontalLines.push({ x, y });
                    }
                }
            }
        }

        // рисуем
        ctx.save();

        ctx.lineWidth = 1;

        ctx.strokeStyle = "red";
        for (const p of verticalLines) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - 4);
            ctx.lineTo(p.x, p.y + 4);
            ctx.stroke();
        }

        ctx.strokeStyle = "lime";
        for (const p of horizontalLines) {
            ctx.beginPath();
            ctx.moveTo(p.x - 4, p.y);
            ctx.lineTo(p.x + 4, p.y);
            ctx.stroke();
        }

        ctx.restore();
    }
    computeOrthogonalGradient2(ctx, w, h, data, step = 6, scale = 4) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return copy[(y * w + x) * 4];
        };

        const kernelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];

        const kernelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];

        ctx.save();

        for (let y = 1; y < h - 1; y += step) {
            for (let x = 1; x < w - 1; x += step) {

                let gx = 0;
                let gy = 0;
                let i = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = get(x + kx, y + ky);
                        gx += v * kernelX[i];
                        gy += v * kernelY[i];
                        i++;
                    }
                }

                const mag = Math.sqrt(gx * gx + gy * gy);
                if (mag < 15) continue;

                const vx = gx / mag;
                const vy = gy / mag;

                // ортогональный
                const nx = -vy;
                const ny = vx;

                // градиент
                ctx.strokeStyle = "red";
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + vx * scale, y + vy * scale);
                ctx.stroke();

                // ортогональный вектор
                ctx.strokeStyle = "cyan";
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + nx * scale, y + ny * scale);
                ctx.stroke();
            }
        }

        ctx.restore();
    }
    findEdgeClusters(ctx, w, h, data, threshold = 11) {
        const visited = new Uint8Array(w * h);
        const edges = new Uint8Array(w * h);
        const scale = 1;
        const get = (x, y) => data[(y * w + x) * 4];

        // карта границ
        ctx.save();

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                const gx =
                    -get(x - 1, y - 1) + get(x + 1, y - 1) +
                    -2 * get(x - 1, y) + 2 * get(x + 1, y) +
                    -get(x - 1, y + 1) + get(x + 1, y + 1);

                const gy =
                    -get(x - 1, y - 1) - 2 * get(x, y - 1) - get(x + 1, y - 1) +
                    get(x - 1, y + 1) + 2 * get(x, y + 1) + get(x + 1, y + 1);

                const mag = Math.sqrt(gx * gx + gy * gy);

                if (mag > threshold) {
                    edges[y * w + x] = 1;

                    const vx = gx / mag;
                    const vy = gy / mag;

                    // ортогональный
                    const nx = -vy;
                    const ny = vx;

                    // градиент
                    ctx.strokeStyle = "red";
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + vx * scale, y + vy * scale);
                    //ctx.lineTo(x + mag * scale, y + mag * scale);
                    ctx.stroke();

                    // ортогональный вектор
                    ctx.strokeStyle = "cyan";
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + nx * scale, y + ny * scale);
                    ctx.stroke();



                }
            }
        }
        ctx.restore();
        const clusters = [];

        const stack = [];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                const id = y * w + x;
                if (!edges[id] || visited[id]) continue;

                let minX = x;
                let minY = y;
                let maxX = x;
                let maxY = y;

                stack.push(id);
                visited[id] = 1;

                while (stack.length) {
                    const p = stack.pop();
                    const px = p % w;
                    const py = (p / w) | 0;

                    minX = Math.min(minX, px);
                    minY = Math.min(minY, py);
                    maxX = Math.max(maxX, px);
                    maxY = Math.max(maxY, py);

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = px + dx;
                            const ny = py + dy;

                            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

                            const nid = ny * w + nx;
                            if (visited[nid]) continue;
                            if (!edges[nid]) continue;

                            visited[nid] = 1;
                            stack.push(nid);
                        }
                    }
                }

                clusters.push({
                    x: minX,
                    y: minY,
                    w: maxX - minX,
                    h: maxY - minY
                });
            }
        }

        return clusters;
    }
    enhanceLocalContrast(w, h, data, radius = 7, strength = 2.0) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return copy[(y * w + x) * 4];
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {

                let sum = 0;
                let count = 0;

                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        sum += get(x + kx, y + ky);
                        count++;
                    }
                }

                const mean = sum / count;

                const p = (y * w + x) * 4;
                const v = copy[p];

                let val = v + (v - mean) * strength;

                if (val < 0) val = 0;
                if (val > 255) val = 255;

                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
            }
        }
    }
    computeOrthogonalGradient(ctx, w, h, data, step = 6, scale = 4) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            x = Math.max(0, Math.min(w - 1, x));
            y = Math.max(0, Math.min(h - 1, y));

            const i = (y * w + x) * 4;

            const r = copy[i];
            const g = copy[i + 1];
            const b = copy[i + 2];

            return (r + g + b) / 3;
        };

        const kernelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];

        const kernelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];

        ctx.save();

        for (let y = 1; y < h - 1; y += step) {
            for (let x = 1; x < w - 1; x += step) {

                let gx = 0;
                let gy = 0;
                let i = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = get(x + kx, y + ky);
                        gx += v * kernelX[i];
                        gy += v * kernelY[i];
                        i++;
                    }
                }

                const mag = Math.sqrt(gx * gx + gy * gy);
                if (mag < 20) continue;

                const vx = gx / mag;
                const vy = gy / mag;

                const nx = -vy;
                const ny = vx;

                ctx.strokeStyle = "cyan";
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + nx * scale, y + ny * scale);
                ctx.stroke();
            }
        }

        ctx.restore();
    }
    detectObjectsFromGradient(ctx, w, h, data, step = 2, threshold = 20) {
        // 1. Сделаем grayscale
        const gray = new Uint8ClampedArray(w * h);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                gray[y * w + x] = (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
        }

        // 2. Градиенты (Sobel)
        const gxKernel = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];
        const gyKernel = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];
        const magnitude = new Float32Array(w * h);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                let gx = 0, gy = 0;
                let k = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const val = gray[(y + ky) * w + (x + kx)];
                        gx += val * gxKernel[k];
                        gy += val * gyKernel[k];
                        k++;
                    }
                }
                magnitude[y * w + x] = Math.sqrt(gx * gx + gy * gy);
            }
        }

        // 3. Thresholding
        const mask = new Uint8Array(w * h);
        for (let i = 0; i < magnitude.length; i++) {
            mask[i] = magnitude[i] > threshold ? 1 : 0;
        }

        // 4. Connected Component Analysis (простая реализация)
        const visited = new Uint8Array(w * h);
        const objects = [];

        function dfs(sx, sy, obj) {
            const stack = [[sx, sy]];
            while (stack.length) {
                const [x, y] = stack.pop();
                const idx = y * w + x;
                if (x < 0 || x >= w || y < 0 || y >= h) continue;
                if (visited[idx] || mask[idx] === 0) continue;

                visited[idx] = 1;
                obj.push([x, y]);

                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }

        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                const idx = y * w + x;
                if (!visited[idx] && mask[idx]) {
                    const obj = [];
                    dfs(x, y, obj);
                    if (obj.length > 3500) objects.push(obj); // фильтр мелких шумов
                }
            }
        }

        // 5. Рисуем bounding boxes
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        objects.forEach(obj => {
            // 1️⃣ Вычисляем границы bounding‑box
            let minX = w, minY = h, maxX = 0, maxY = 0;
            obj.forEach(([x, y]) => {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            });

            const rectX = minX;
            const rectY = minY;
            const rectW = maxX - minX;
            const rectH = maxY - minY;

            // 2️⃣ Рисуем сам прямоугольник
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(rectX, rectY, rectW, rectH);

            // 3️⃣ Текст, который нужно отобразить
            const label = `${obj.length} w:${rectW} h:${rectH} w/h:${rectW / rectH}`;          // например, количество точек
            // const label = "Box 1";          // или произвольная метка

            // 4️⃣ Настраиваем шрифт и цвет текста
            ctx.font = "32px Arial";
            ctx.fillStyle = "white";           // цвет текста
            ctx.textBaseline = "top";
            ctx.textAlign = "left";

            // 5️⃣ Измеряем ширину текста, чтобы центрировать
            const textMetrics = ctx.measureText(label);
            const textW = textMetrics.width;
            const textH = 18; // приближённая высота шрифта (можно уточнить)

            // 6️⃣ Вычисляем позицию текста внутри прямоугольника
            const padding = 4; // отступ от границ прямоугольника
            const textX = rectX + (rectW - textW) / 2;
            const textY = rectY + padding;

            // 7️⃣ (Опционально) рисуем фон под текстом для читаемости
            ctx.fillStyle = "rgba(0,0,0,0.6)"; // полупрозрачный чёрный фон
            ctx.fillRect(textX - padding, textY - padding, textW + 2 * padding, textH + 2 * padding);

            // 8️⃣ Рисуем сам текст
            ctx.fillStyle = "white";
            ctx.fillText(label, textX, textY);
        });

        return objects;
    }
}













class SimpleOCR {
    constructor(container) {
        this.container = container;
        this.templates = {};
        this.templateSize = 20;
        this.threshold = 140;
        this.initCanvas();
        this.generateTemplates("aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789[.]");
        const russian = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
        const english = "abcdefghijklmnopqrstuvwxyz";
        const number = "0123456789+-'";


        this.point1 = [];
        this.point2 = [];
        this.pick = [];
        this.min = [Infinity, Infinity, Infinity];
        this.max = [-Infinity, -Infinity, -Infinity];
    }

    initCanvas() {
        const canvas = document.createElement("canvas");
        //canvas.style.width = "100%";
        canvas.addEventListener('click', (e) => this.handleClick(e));
        this.container.appendChild(canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    async loadImage(src) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);

        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();

        const x = (event.clientX - rect.left) | 0;
        const y = (event.clientY - rect.top) | 0;

        const w = this.canvas.width;
        const p = ((y * w + x) << 2);

        const d = this.imageData.data;

        const r = d[p];
        const g = d[p + 1];
        const b = d[p + 2];
        const a = d[p + 3];

        // сохраняем выбранный цвет
        this.pick.push({ r, g, b });

        // обновление min/max быстрее
        this.min[0] = Math.min(this.min[0], r);
        this.min[1] = Math.min(this.min[1], g);
        this.min[2] = Math.min(this.min[2], b);

        this.max[0] = Math.max(this.max[0], r);
        this.max[1] = Math.max(this.max[1], g);
        this.max[2] = Math.max(this.max[2], b);

        console.log({ min: this.min, max: this.max });

        // выбор двух точек
        if (!this.point1.length) {
            this.point1 = [r, g, b];
            return;
        }

        this.point2 = [r, g, b];

        const deltaColorSize3 = ([r, g, b], [r2, g2, b2]) => [r - r2, g - g2, b - b2];

        //console.log("cosine:", this.cosineSimilarity(this.point1, this.point2));
        console.log("delta:", deltaColorSize3(this.point1, this.point2));

        this.point1 = [];
        this.point2 = [];
    }
    binarize(data, imageData) {
        const { data: d, width: w, height: h } = imageData;
        const binary = new Uint8Array(w * h);

        for (let i = 0; i < w * h; i++) {

            const p = i * 4;
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];
            const gray = (0.299 * r + 0.587 * g + 0.114 * b) | 0;

            data[p] = gray;
            data[p + 1] = gray;
            data[p + 2] = gray;
            binary[i] = gray < this.threshold ? 1 : 0;

            //const point = gray < this.threshold ? 0 : 255;
            //data[p] = point;
            //data[p + 1] = point;
            //data[p + 2] = point;
        }
        return { binary, w, h };
    }

    findComponents(binary, w, h) {
        const visited = new Uint8Array(w * h);
        const boxes = [];

        const flood = (sx, sy) => {
            const stack = [[sx, sy]];
            let minX = sx, maxX = sx, minY = sy, maxY = sy;

            while (stack.length) {
                const [x, y] = stack.pop();
                if (x < 0 || y < 0 || x >= w || y >= h) continue;

                const idx = y * w + x;
                if (visited[idx] || !binary[idx]) continue;

                visited[idx] = 1;

                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);

                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }

            return { minX, minY, maxX, maxY };
        };

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                if (binary[idx] && !visited[idx]) {
                    const box = flood(x, y);
                    const bw = box.maxX - box.minX;
                    const bh = box.maxY - box.minY;

                    if (bw > 4 && bh > 4) boxes.push(box);
                }
            }
        }

        boxes.sort((a, b) => a.minX - b.minX);
        return boxes;
    }

    extractChar(binary, w, box) {
        const cw = box.maxX - box.minX + 1;
        const ch = box.maxY - box.minY + 1;
        const arr = new Uint8Array(cw * ch);

        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                const srcX = box.minX + x;
                const srcY = box.minY + y;
                arr[y * cw + x] = binary[srcY * w + srcX];
            }
        }

        return { data: arr, width: cw, height: ch };
    }

    normalize(char) {
        const size = this.templateSize;
        const out = new Uint8Array(size * size);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const sx = Math.floor(x * char.width / size);
                const sy = Math.floor(y * char.height / size);
                out[y * size + x] = char.data[sy * char.width + sx];
            }
        }

        return out;
    }

    generateTemplates(alphabet) {
        alphabet.split("").forEach(ch => {
            this.templates[ch] = this.createTemplate(ch);
        });
    }

    createTemplate(char) {
        const size = this.templateSize;
        const c = document.createElement("canvas");
        this.container.appendChild(c);
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "black";
        ctx.font = "18px Arial";
        ctx.fillText(char, 2, 16);

        const img = ctx.getImageData(0, 0, size, size).data;
        const arr = new Uint8Array(size * size);

        for (let i = 0; i < arr.length; i++) {
            const p = i * 4;
            const gray = (img[p] + img[p + 1] + img[p + 2]) / 3;
            arr[i] = gray < 128 ? 1 : 0;
        }

        return arr;
    }

    compare(a, b) {
        let score = 0;
        for (let i = 0; i < a.length; i++) {
            if (a[i] === b[i]) score++;
        }
        return score;
    }

    recognizeChar(matrix) {
        let best = "?";
        let bestScore = -1;

        for (const key in this.templates) {
            const score = this.compare(matrix, this.templates[key]);
            if (score > bestScore) {
                bestScore = score;
                best = key;
            }
        }

        return best;
    }



    computeOrthogonalGradient(ctx, w, h, data, step = 8, scale = 4) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return copy[(y * w + x) * 4];
        };

        const kernelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];

        const kernelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];

        ctx.save();

        for (let y = 1; y < h - 1; y += step) {
            for (let x = 1; x < w - 1; x += step) {

                let gx = 0;
                let gy = 0;
                let i = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = get(x + kx, y + ky);
                        gx += v * kernelX[i];
                        gy += v * kernelY[i];
                        i++;
                    }
                }

                const mag = Math.sqrt(gx * gx + gy * gy);



                const c = (y * w + x) * 4;
                //data[c] = 255;
                //data[c + 1] = 255;
                //data[c + 2] = 255;

                if (mag < 5) continue;

                const vx = gx / mag;
                const vy = gy / mag;

                // ортогональный
                const nx = -vy;
                const ny = vx;

                /**градиент**/
                ctx.strokeStyle = "red";
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + vx * scale, y + vy * scale);
                ctx.stroke();

                /**ортогональный вектор**/
                ctx.strokeStyle = "cyan";
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + nx * scale, y + ny * scale);
                ctx.stroke();

                //data[c] = mag;
                //data[c + 1] = mag;
                //data[c + 2] = mag;
            }
        }

        ctx.restore();
    }

    detectOrthogonalLinesAndDraw(ctx, w, h, data, threshold = 20) {
        const copy = new Uint8ClampedArray(data);

        const get = (x, y) => {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x >= w) x = w - 1;
            if (y >= h) y = h - 1;
            return copy[(y * w + x) * 4];
        };

        const kernelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ];

        const kernelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ];

        const verticalLines = [];
        const horizontalLines = [];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {

                let gx = 0;
                let gy = 0;
                let i = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = get(x + kx, y + ky);
                        gx += v * kernelX[i];
                        gy += v * kernelY[i];
                        i++;
                    }
                }

                const mag = Math.sqrt(gx * gx + gy * gy);

                if (mag > threshold) {
                    const angle = Math.atan2(gy, gx);

                    // вертикальная линия
                    if (Math.abs(angle) < 0.4 || Math.abs(angle) > 2.7) {
                        verticalLines.push({ x, y });
                    }
                    // горизонтальная линия
                    else if (Math.abs(Math.abs(angle) - Math.PI / 2) < 0.04) {
                        horizontalLines.push({ x, y });
                    }
                }
            }
        }

        // рисуем
        ctx.save();

        ctx.lineWidth = 1;

        ctx.strokeStyle = "red";
        for (const p of verticalLines) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - 4);
            ctx.lineTo(p.x, p.y + 4);
            ctx.stroke();
        }

        ctx.strokeStyle = "lime";
        for (const p of horizontalLines) {
            ctx.beginPath();
            ctx.moveTo(p.x - 4, p.y);
            ctx.lineTo(p.x + 4, p.y);
            ctx.stroke();
        }

        ctx.restore();
    }
    sobelFast(w, h, dataRGBA) {
        const gray = new Float32Array(w * h);
        const out = new Float32Array(w * h);

        // grayscale
        for (let i = 0, j = 0; i < dataRGBA.length; i += 4, j++) {
            gray[j] =
                0.299 * dataRGBA[i] +
                0.587 * dataRGBA[i + 1] +
                0.114 * dataRGBA[i + 2];
        }

        for (let y = 1; y < h - 1; y++) {
            const yw = y * w;

            for (let x = 1; x < w - 1; x++) {
                const i = yw + x;

                const a = gray[i - w - 1];
                const b = gray[i - w];
                const c = gray[i - w + 1];

                const d = gray[i - 1];
                const f = gray[i + 1];

                const g = gray[i + w - 1];
                const h1 = gray[i + w];
                const k = gray[i + w + 1];

                const gx = -a - 2 * d - g + c + 2 * f + k;
                const gy = -a - 2 * b - c + g + 2 * h1 + k;

                const mag = Math.sqrt(gx * gx + gy * gy);
                out[i] = mag;

                // индекс в RGBA
                const p = i * 4;

                dataRGBA[p] = mag;
                dataRGBA[p + 1] = mag;
                dataRGBA[p + 2] = mag;
                dataRGBA[p + 3] = 255;
            }
        }

        return out;
    }


    /**
     * 
     * @param {width} w
     * @param {height} h
     * @param {imageData} data
     * @returns
     */
    grayScale(w, h, data) {
        const gray = new Uint8Array(w * h);

        for (let i = 0; i < w * h; i++) {
            const p = i * 4;

            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];

            const v = gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;

            data[p] = v;
            data[p + 1] = v;
            data[p + 2] = v;
        }

        return gray;
    }

    blur(w, h, data, radius = 3, sigma = 1.4) {
        const out = new Uint8ClampedArray(data.length);

        // создаем гауссово ядро
        const kernelSize = radius * 2 + 1;
        const kernel = new Float32Array(kernelSize);
        let sum = 0;

        for (let i = -radius; i <= radius; i++) {
            const v = Math.exp(-(i * i) / (2 * sigma * sigma));
            kernel[i + radius] = v;
            sum += v;
        }

        // нормализация
        for (let i = 0; i < kernelSize; i++) {
            kernel[i] /= sum;
        }

        const temp = new Float32Array(data.length);

        // --- горизонтальный проход ---
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r = 0, g = 0, b = 0, a = 0;

                for (let k = -radius; k <= radius; k++) {
                    let px = x + k;
                    if (px < 0) px = 0;
                    if (px >= w) px = w - 1;

                    const idx = (y * w + px) * 4;
                    const weight = kernel[k + radius];

                    r += data[idx] * weight;
                    g += data[idx + 1] * weight;
                    b += data[idx + 2] * weight;
                    a += data[idx + 3] * weight;
                }

                const i = (y * w + x) * 4;
                temp[i] = r;
                temp[i + 1] = g;
                temp[i + 2] = b;
                temp[i + 3] = a;
            }
        }

        // --- вертикальный проход ---
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r = 0, g = 0, b = 0, a = 0;

                for (let k = -radius; k <= radius; k++) {
                    let py = y + k;
                    if (py < 0) py = 0;
                    if (py >= h) py = h - 1;

                    const idx = (py * w + x) * 4;
                    const weight = kernel[k + radius];

                    r += temp[idx] * weight;
                    g += temp[idx + 1] * weight;
                    b += temp[idx + 2] * weight;
                    a += temp[idx + 3] * weight;
                }

                const i = (y * w + x) * 4;
                out[i] = r;
                out[i + 1] = g;
                out[i + 2] = b;
                out[i + 3] = a;
            }
        }

        return out;
    }
    blurGray(w, h, gray, radius = 3, sigma = 1.4) {
        const out = new Uint8Array(w * h);

        const kernelSize = radius * 2 + 1;
        const kernel = new Float32Array(kernelSize);

        let sum = 0;
        for (let i = -radius; i <= radius; i++) {
            const v = Math.exp(-(i * i) / (2 * sigma * sigma));
            kernel[i + radius] = v;
            sum += v;
        }

        for (let i = 0; i < kernelSize; i++) kernel[i] /= sum;

        const temp = new Float32Array(w * h);

        // horizontal
        for (let y = 0; y < h; y++) {
            const row = y * w;
            for (let x = 0; x < w; x++) {
                let sum = 0;

                for (let k = -radius; k <= radius; k++) {
                    let px = x + k;
                    if (px < 0) px = 0;
                    if (px >= w) px = w - 1;

                    sum += gray[row + px] * kernel[k + radius];
                }

                temp[row + x] = sum;
            }
        }

        // vertical
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sum = 0;

                for (let k = -radius; k <= radius; k++) {
                    let py = y + k;
                    if (py < 0) py = 0;
                    if (py >= h) py = h - 1;

                    sum += temp[py * w + x] * kernel[k + radius];
                }

                out[y * w + x] = sum;
            }
        }

        return out;
    }
    sobelFastGray(w, h, gray) {
        const out = new Float32Array(w * h);

        for (let y = 1; y < h - 1; y++) {
            const row = y * w;
            const rowUp = row - w;
            const rowDown = row + w;

            // первое окно
            let a = gray[rowUp + 0];
            let b = gray[rowUp + 1];
            let c = gray[rowUp + 2];

            let d = gray[row + 0];
            let e = gray[row + 1];
            let f = gray[row + 2];

            let g = gray[rowDown + 0];
            let h1 = gray[rowDown + 1];
            let k = gray[rowDown + 2];

            for (let x = 1; x < w - 1; x++) {
                const i = row + x;

                const gx = -a - 2 * d - g + c + 2 * f + k;
                const gy = -a - 2 * b - c + g + 2 * h1 + k;

                out[i] = Math.sqrt(gx * gx + gy * gy);

                // сдвиг окна вправо
                a = b;
                b = c;
                c = gray[rowUp + x + 2];

                d = e;
                e = f;
                f = gray[row + x + 2];

                g = h1;
                h1 = k;
                k = gray[rowDown + x + 2];
            }
        }

        return out;
    }
    renderEdges(edges, w, h, data) {
        let max = 0;
        for (let i = 0; i < edges.length; i++) {
            if (edges[i] > max) max = edges[i];
        }
        const scale = max === 0 ? 0 : 255 / max;

        for (let i = 0; i < edges.length; i++) {
            const v = edges[i] * scale;
            const p = i * 4;

            data[p] = v;
            data[p + 1] = v;
            data[p + 2] = v;
            data[p + 3] = 255;
        }
    }
    connectedTwoPass(w, h, edges, threshold = 15) {
        const labels = new Int32Array(w * h);
        const parent = new Int32Array(w * h);
        let nextLabel = 1;

        const find = (x) => {
            while (parent[x] !== x) x = parent[x];
            return x;
        };

        const union = (a, b) => {
            a = find(a);
            b = find(b);
            if (a !== b) parent[b] = a;
        };

        // первый проход
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = y * w + x;

                if (edges[i] < threshold) continue;

                const left = labels[i - 1];
                const up = labels[i - w];

                if (left === 0 && up === 0) {
                    labels[i] = nextLabel;
                    parent[nextLabel] = nextLabel;
                    nextLabel++;
                } else if (left !== 0 && up === 0) {
                    labels[i] = left;
                } else if (left === 0 && up !== 0) {
                    labels[i] = up;
                } else {
                    labels[i] = left;
                    union(left, up);
                }
            }
        }

        // второй проход
        for (let i = 0; i < labels.length; i++) {
            if (labels[i] !== 0) {
                labels[i] = find(labels[i]);
            }
        }

        return { labels, count: nextLabel - 1 };
    }
    renderLabels(labels, w, h, imageData) {
        const data = imageData;

        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            const p = i * 4;

            if (label === 0) {
                data[p] = 0;
                data[p + 1] = 0;
                data[p + 2] = 0;
            } else {
                // псевдо-случайный цвет
                data[p] = (label * 53) % 256;
                data[p + 1] = (label * 97) % 256;
                data[p + 2] = (label * 151) % 256;
            }

            data[p + 3] = 255;
        }
    }
    async recognize(src) {
        const imageData = await this.loadImage(src);
        this.imageData = imageData;
        const { width: w, height: h } = this.canvas;
        const d = imageData.data;

        const gray = this.grayScale(w, h, d);

        const blurred = this.blurGray(w, h, gray, 8, 8/2);

        const edges = this.sobelFastGray(w, h, blurred);
        const {labels } = this.connectedTwoPass(w, h, edges)
        this.renderLabels(labels, w, h, d);
        //this.renderEdges(edges, w, h, d);

        this.ctx.putImageData(imageData, 0, 0);

    }
    а(){
        //this.computeOrthogonalGradient(this.ctx, w, h, imageData.data);
        //this.ctx.putImageData(imageData, 0, 0);

        //this.detectOrthogonalLinesAndDraw(this.ctx, w, h, imageData.data);

        //{
        //    const { binary, w, h } = this.binarize(imageData);
        //    const boxes = this.findComponents(binary, w, h);

        //    const chars = boxes.map(box =>
        //        this.normalize(this.extractChar(binary, w, box))
        //    );

        //    return chars.map(c => this.recognizeChar(c)).join("");
        //}
    }
}




























class imegScan {
    constructor() {
        this.container = document.getElementById('test');
        this.imageSrc = '20260210_200642.jpg';
        this.similarityThreshold = 0.9991882472284763; // cosine similarity threshold
        this.rangeDeviation = 0.9999059577582198;
        this.blendWeight = 1;
        this.canvas = null;
        this.ctx = null;
        this.point1 = [];
        this.point2 = [];
        this.pick = [];
        this.min = [Infinity, Infinity, Infinity];
        this.max = [-Infinity, -Infinity, -Infinity];
        this.joinPixel();
    }
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();

        const x = (event.clientX - rect.left) | 0;
        const y = (event.clientY - rect.top) | 0;

        const w = this.canvas.width;
        const p = ((y * w + x) << 2);

        const d = this.imageData.data;

        const r = d[p];
        const g = d[p + 1];
        const b = d[p + 2];
        const a = d[p + 3];

        // сохраняем выбранный цвет
        this.pick.push({ r, g, b });

        // обновление min/max быстрее
        this.min[0] = Math.min(this.min[0], r);
        this.min[1] = Math.min(this.min[1], g);
        this.min[2] = Math.min(this.min[2], b);

        this.max[0] = Math.max(this.max[0], r);
        this.max[1] = Math.max(this.max[1], g);
        this.max[2] = Math.max(this.max[2], b);

        console.log({ min: this.min, max: this.max });

        // выбор двух точек
        if (!this.point1.length) {
            this.point1 = [r, g, b];
            return;
        }

        this.point2 = [r, g, b];

        console.log("cosine:", this.cosineSimilarity(this.point1, this.point2));
        console.log("delta:", this.deltaColorSize3(this.point1, this.point2));

        this.point1 = [];
        this.point2 = [];
    }
    deltaColorSize3(a, b) {
        return [
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]
        ];
    }
    joinPixel() {
        const canvas = document.createElement('canvas');
        canvas.addEventListener('click', (e) => this.handleClick(e));
        this.container.appendChild(canvas);
        this.canvas = canvas;

        const ctx = canvas.getContext('2d');
        this.ctx = ctx;
        const img = new Image();

        // If the image is hosted on another domain, set CORS to allow pixel manipulation
        img.crossOrigin = 'Anonymous';
        img.src = '20260210_200642.jpg'; // <-- replace with your image path

        const ocr = new SimpleOCR(document.body);

        ocr.recognize("20260210_200642.jpg").then(text => {
            console.log("Текст:", text);
        });

        //img.onload = () => {
        //    canvas.width = img.width;
        //    canvas.height = img.height;
        //    ctx.drawImage(img, 0, 0);
        //    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //    const data = imageData.data; // Uint8ClampedArray
        //    const [w, h] = [canvas.width, canvas.height];
        //    //this.processPixels(data);
        //    //this.processPixels2(data);
        //    //this.processPixelsDeltaRGB(data);
        //    //this.segmentColorRegions(canvas.width, canvas.height, data);
        //    //this.autoSegmentKMeans(canvas.width, canvas.height, data);
        //    //this.segmentImageAdvanced(canvas.width, canvas.height, data);
        //    //this.segmentImagePro(canvas.width, canvas.height, data);

        //    //this.detectSymbols(w, h, data);
        //    //this.detectTextSymbols(w, h, data);
        //    //this.detectTextOCR(w, h, data);                                                       // good?
        //    //this.detectTextLinesAndSymbols(w, h, data);                                           // good?
        //    //this.detectSymbolsAdvanced(w, h, data);
        //    //this.detectTextSymbols2(w, h, data);                                                    // много шума
        //    //this.detectSymbolsAdvanced2(w, h, data);
        //    //this.detectOCR(w, h, data);
        //    //this.segmentFelzenszwalb(w, h, data);


        //    ctx.putImageData(imageData, 0, 0);

        //};

        //img.onload = () => {
        //    canvas.width = img.width;
        //    canvas.height = img.height;
        //    canvas.style.width = "100%";
        //    ctx.drawImage(img, 0, 0);
        //    console.dir(img);
        //    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //    const data = imageData.data;
        //    const original = new Uint8ClampedArray(data);
        //    const w = canvas.width;
        //    const h = canvas.height;

        //    const engine = new MiniOCREngine();

        //    //imageData.data.set();

        //    ////engine.detectOrthogonalLines(w, h, data);

        //    //// preprocessing
        //    ////ctx.putImageData(imageData, 0, 0);
        //    //engine.grayscale(w, h, data);
        //    //engine.boxBlur(w, h, data);
        //    //engine.medianFilter(w, h, data, 1, 2);
        //    ////engine.enhanceLocalContrast(w, h, data, 9, 2.5);
        //    ////engine.enhanceLocalContrastRGB(w, h, data, 100, 1.9+50);

        //    //////engine.gradientImage(w, h, data);
        //    //engine.binarizeAdaptive(w,h,data,54,7)

        //    //const radius =108 / 2 | 1
        //    ////engine.sauvolaBinarizeFast(w, h, data, radius, 0.055);
        //    ////engine.sauvolaBinarize(w, h, data, 14, 0.01);
        //    ////engine.removeSmallComponents(w, h, data, 80);

        //    ////engine.removeNoise(w, h, data);
        //    ////engine.erode(w, h, data, 1, 1);
        //    ////engine.dilate(w, h, data, 1, 2);


        //    ////const lines = engine.detectHorizontalLines(w, h, data);
        //    ////const vectors = engine.vectorize3x3(w, h, data);


        //    engine.grayscale(w, h, data);
        //    engine.boxBlur(w, h, data);
        //    engine.medianFilter(w, h, data, 1, 2);
        //    //engine.binarizeAdaptive(w, h, data, 54, 7);
        //    ctx.putImageData(imageData, 0, 0);


        //    ////const clusters = engine.findEdgeClusters(ctx,w, h, data);
        //    ////for (const c of clusters) {
        //    ////    if (c.w < 20 || c.h < 20) continue;

        //    ////    ctx.strokeStyle = "yellow";
        //    ////    ctx.strokeRect(c.x, c.y, c.w, c.h);
        //    ////}
        //    ////engine.scan(w, h, data, ctx);

        //    //engine.detectOrthogonalLinesAndDraw(ctx,w,h,data);
        //    //engine.computeOrthogonalGradient(ctx, w, h, data);
        //    engine.detectObjectsFromGradient(ctx, w, h, data);

        //    //// поиск символов
        //    ////const boxes = engine.findCharacters(w, h, data);
        //    ////const boxes = engine.findRows(w, h, data);
        //    ////const numberBoxes = engine.findNumberBoxes(w, h, data);
        //    ////const labelBoxes = engine.findLabelBoxes(numberBoxes, w, h, data);
        //    ////const greenBox = engine.findGreenBox(w, h, original);


        //    ////engine.drawLines(ctx, lines);
        //    ////engine.drawVectors(ctx, vectors, w, h);

        //    //const rows = engine.findTableRows(w, h, data);
        //    //const numberBoxes = engine.findNumberBoxes(rows, w, h, data);
        //    //const labelBoxes = engine.findLabelBoxes(numberBoxes, w, h, data);
        //    //const greenBox = engine.findGreenBox(w, h, original);


        //    //const result = engine.detectRows(w, h, data);


        //    ////engine.drawProjection(ctx, result.projection, w, h, result.threshold);
        //    ////engine.drawRows(ctx, result.rows, w);
        //    ////console.log("символов найдено:", boxes.length);
        //    ////console.log("строк найдено:", lines.length);

        //    //// рисуем bounding boxes
        //    //ctx.lineWidth = 4;
        //    //ctx.strokeStyle = "green";
        //    //ctx.strokeRect(0, 0, radius * 2, radius * 2);
        //    //for (const box of greenBox) {
        //    //    ctx.strokeRect(box.x, box.y, box.w, box.h);
        //    //}
        //    ////for (const box of rows) {
        //    ////    ctx.strokeRect(box.y, box.h, box.y, box.h);
        //    ////}

        //    ////ctx.strokeStyle = "red";
        //    ////for (const box of numberBoxes) {
        //    ////    ctx.strokeRect(box.x, box.y, box.w, box.h);
        //    ////}
        //    ////ctx.strokeStyle = "blue";
        //    ////for (const box of labelBoxes) {
        //    ////    ctx.strokeRect(box.x, box.y, box.w, box.h);
        //    ////}

        //    //// нормализация символов
        //    //const glyphs = boxes.map(box =>
        //    //    engine.normalizeGlyph(w, h, data, box)
        //    //);

        //    //console.log("glyph matrices:", glyphs);
        //    //this.run();
        //};

        img.onerror = (e) => console.error('Не удалось загрузить изображение:', e);
    }
    run() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const original = new Uint8ClampedArray(data);
        const w = canvas.width;
        const h = canvas.height;

        const engine = new MiniOCREngine();

        engine.grayscale(w, h, data);
        engine.boxBlur(w, h, data);
        engine.medianFilter(w, h, data, 1, 2);
        engine.binarizeAdaptive(w, h, data, 54, 7)
        ctx.putImageData(imageData, 0, 0);
    }
    nnf() {
        //this.processPixels(data);
        //this.processPixels2(data);
        //this.processPixelsDeltaRGB(data);
        //this.segmentColorRegions(canvas.width, canvas.height, data);
        //this.autoSegmentKMeans(canvas.width, canvas.height, data);
        //this.segmentImageAdvanced(canvas.width, canvas.height, data);
        //this.segmentImagePro(canvas.width, canvas.height, data);

        //this.detectSymbols(w, h, data);
        //this.detectTextSymbols(w, h, data);
        //this.detectTextOCR(w, h, data);                                                       // good?
        //this.detectTextLinesAndSymbols(w, h, data);                                           // good?
        //this.detectSymbolsAdvanced(w, h, data);
        //this.detectTextSymbols2(w, h, data);                                                    // много шума
        //this.detectSymbolsAdvanced2(w, h, data);
        //this.detectOCR(w, h, data);
        //this.segmentFelzenszwalb(w, h, data);


        //const engine = new SimpleOCREngine(canvas);
        //this.net = new MiniNet();

        //engine.boxBlur(canvas.width, canvas.height, data);
        //engine.binarizeAdaptive(canvas.width, canvas.height, data);
        //engine.removeNoise(canvas.width, canvas.height, data);
        //engine.dilate(canvas.width, canvas.height, data);

        //const symbols = engine.findConnectedComponents(canvas.width, canvas.height, data);
        //const filtered = engine.filterSymbols(symbols);

        //ctx.putImageData(imageData, 0, 0);
        //engine.drawSymbols(ctx, filtered);

        //engine.trainOnClick(
        //    filtered,
        //    canvas.width,
        //    canvas.height,
        //    data,
        //    this.net
        //);






        //const engine = new MiniOCREngine();

        //engine.grayscale(w, h, data);

        //engine.boxBlur(w, h, data);

        //engine.binarizeAdaptive(w, h, data, 12, 3);

        //engine.removeNoise(w, h, data);

        //engine.erode(w, h, data);

        //engine.dilate(w, h, data);

        //ctx.putImageData(imageData, 0, 0);




        //const engine = new SimpleOCREngine(canvas);
        //this.net = new MiniNet();

        //engine.boxBlur(canvas.width, canvas.height, data);
        //engine.binarizeAdaptive(canvas.width, canvas.height, data);
        //engine.removeNoise(canvas.width, canvas.height, data);
        //engine.dilate(canvas.width, canvas.height, data);

        //const symbols = engine.findConnectedComponents(canvas.width, canvas.height, data);
        //const filtered = engine.filterSymbols(symbols);


        //engine.drawSymbols(ctx, filtered);

        //engine.trainOnClick(
        //    filtered,
        //    canvas.width,
        //    canvas.height,
        //    data,
        //    this.net
        //);


        //const symbols = engine.findConnectedComponents(w, h, data);

        //ctx.strokeStyle = "red";
        //ctx.lineWidth = 1;

        //for (const s of symbols) {
        //    ctx.strokeRect(s.x, s.y, s.w, s.h);
        //}
    }
    binarize(width, height, data) {

        let sum = 0;
        const size = width * height;

        for (let i = 0; i < data.length; i += 4) {
            const gray =
                data[i] * 0.299 +
                data[i + 1] * 0.587 +
                data[i + 2] * 0.114;

            sum += gray;
        }

        const threshold = sum / size;

        for (let i = 0; i < data.length; i += 4) {

            const gray =
                data[i] * 0.299 +
                data[i + 1] * 0.587 +
                data[i + 2] * 0.114;

            const v = gray > threshold ? 255 : 0;

            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
        }
    }
    segmentFelzenszwalb(width, height, data, k = 400, minSize = 50) {

        const size = width * height;

        const parent = new Int32Array(size);
        const rank = new Int32Array(size);
        const compSize = new Int32Array(size);
        const internalDiff = new Float32Array(size);

        for (let i = 0; i < size; i++) {
            parent[i] = i;
            rank[i] = 0;
            compSize[i] = 1;
            internalDiff[i] = 0;
        }

        const find = (x) => {
            while (parent[x] !== x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };

        const union = (a, b, w) => {
            a = find(a);
            b = find(b);
            if (a === b) return;

            if (rank[a] < rank[b]) {
                [a, b] = [b, a];
            }

            parent[b] = a;
            compSize[a] += compSize[b];
            internalDiff[a] = Math.max(w, internalDiff[a], internalDiff[b]);

            if (rank[a] === rank[b]) rank[a]++;
        };

        const diff = (i1, i2) => {
            const p1 = i1 * 4;
            const p2 = i2 * 4;

            const dr = data[p1] - data[p2];
            const dg = data[p1 + 1] - data[p2 + 1];
            const db = data[p1 + 2] - data[p2 + 2];

            return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        // строим граф
        const edges = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const i = y * width + x;

                if (x < width - 1) {
                    edges.push({
                        a: i,
                        b: i + 1,
                        w: diff(i, i + 1)
                    });
                }

                if (y < height - 1) {
                    edges.push({
                        a: i,
                        b: i + width,
                        w: diff(i, i + width)
                    });
                }
            }
        }

        edges.sort((e1, e2) => e1.w - e2.w);

        const threshold = (size) => k / size;

        for (const e of edges) {

            let a = find(e.a);
            let b = find(e.b);

            if (a === b) continue;

            if (
                e.w <= internalDiff[a] + threshold(compSize[a]) &&
                e.w <= internalDiff[b] + threshold(compSize[b])
            ) {
                union(a, b, e.w);
            }
        }

        // merge small regions
        for (const e of edges) {

            let a = find(e.a);
            let b = find(e.b);

            if (a !== b && (compSize[a] < minSize || compSize[b] < minSize)) {
                union(a, b, e.w);
            }
        }

        // визуализация областей
        const colors = {};

        for (let i = 0; i < size; i++) {

            const root = find(i);

            if (!colors[root]) {
                colors[root] = [
                    Math.random() * 255,
                    Math.random() * 255,
                    Math.random() * 255
                ];
            }

            const p = i * 4;
            const c = colors[root];

            data[p] = c[0];
            data[p + 1] = c[1];
            data[p + 2] = c[2];
        }

        console.log("segments:", Object.keys(colors).length);
    }
    detectOCR(width, height, data) {

        const size = width * height;

        // grayscale
        const gray = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        // --- адаптивная бинаризация ---
        const radius = 12;
        const bin = new Uint8Array(size);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                let sum = 0;
                let sq = 0;
                let count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    const ny = y + dy;
                    if (ny < 0 || ny >= height) continue;

                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        if (nx < 0 || nx >= width) continue;

                        const v = gray[ny * width + nx];
                        sum += v;
                        sq += v * v;
                        count++;
                    }
                }

                const mean = sum / count;
                const variance = sq / count - mean * mean;
                const std = Math.sqrt(Math.max(variance, 0));

                const k = 0.34;
                const threshold = mean * (1 + k * ((std / 128) - 1));

                const v = gray[y * width + x];
                bin[y * width + x] = v < threshold ? 1 : 0;
            }
        }

        // --- удаление шума ---
        const clean = new Uint8Array(size);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                let sum = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        sum += bin[(y + dy) * width + (x + dx)];
                    }
                }

                clean[y * width + x] = sum >= 3 ? 1 : 0;
            }
        }

        // --- dilation текста ---
        const morph = new Uint8Array(size);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                let hit = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (clean[(y + dy) * width + (x + dx)]) {
                            hit = 1;
                            break;
                        }
                    }
                    if (hit) break;
                }

                morph[y * width + x] = hit;
            }
        }

        // --- connected components ---
        const visited = new Uint8Array(size);
        const symbols = [];

        for (let i = 0; i < size; i++) {

            if (visited[i] || morph[i] === 0) continue;

            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;
            let area = 0;

            const stack = [i];

            while (stack.length) {

                const idx = stack.pop();
                if (visited[idx]) continue;
                if (!morph[idx]) continue;

                visited[idx] = 1;
                area++;

                const x = idx % width;
                const y = (idx / width) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (x > 0) stack.push(idx - 1);
                if (x < width - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - width);
                if (y < height - 1) stack.push(idx + width);
            }

            const w = maxX - minX;
            const h = maxY - minY;
            const ratio = w / (h || 1);

            if (
                area > 50 &&
                w > 6 &&
                h > 10 &&
                ratio > 0.15 &&
                ratio < 1.3
            ) {
                symbols.push({
                    x: minX,
                    y: minY,
                    w,
                    h,
                    cx: minX + w / 2,
                    cy: minY + h / 2
                });
            }
        }

        // --- группировка строк ---
        const lines = [];

        for (const s of symbols) {

            let placed = false;

            for (const line of lines) {
                if (Math.abs(line.y - s.cy) < 25) {
                    line.symbols.push(s);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                lines.push({
                    y: s.cy,
                    symbols: [s]
                });
            }
        }

        // сортировка
        for (const line of lines) {
            line.symbols.sort((a, b) => a.x - b.x);
        }

        // --- визуализация ---
        for (const line of lines) {
            for (const s of line.symbols) {

                for (let x = s.x; x <= s.x + s.w; x++) {

                    const t = (s.y * width + x) * 4;
                    const b = ((s.y + s.h) * width + x) * 4;

                    data[t] = 255;
                    data[t + 1] = 0;
                    data[t + 2] = 0;

                    data[b] = 255;
                    data[b + 1] = 0;
                    data[b + 2] = 0;
                }

                for (let y = s.y; y <= s.y + s.h; y++) {

                    const l = (y * width + s.x) * 4;
                    const r = (y * width + s.x + s.w) * 4;

                    data[l] = 255;
                    data[l + 1] = 0;
                    data[l + 2] = 0;

                    data[r] = 255;
                    data[r + 1] = 0;
                    data[r + 2] = 0;
                }
            }
        }

        console.log("OCR lines:", lines);
        return lines;
    }
    detectSymbolsAdvanced2(width, height, data) {

        const size = width * height;

        // 1 grayscale
        const gray = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        // 2 усиление контраста
        let min = 255;
        let max = 0;

        for (let i = 0; i < size; i++) {
            const v = gray[i];
            if (v < min) min = v;
            if (v > max) max = v;
        }

        const norm = new Uint8Array(size);
        const scale = 255 / (max - min + 1);

        for (let i = 0; i < size; i++) {
            norm[i] = (gray[i] - min) * scale;
        }

        // 3 edge detection (Sobel)
        const edge = new Uint8Array(size);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                const i = y * width + x;

                const gx =
                    -norm[i - width - 1] +
                    norm[i - width + 1] +
                    -2 * norm[i - 1] +
                    2 * norm[i + 1] +
                    -norm[i + width - 1] +
                    norm[i + width + 1];

                const gy =
                    -norm[i - width - 1] +
                    -2 * norm[i - width] +
                    -norm[i - width + 1] +
                    norm[i + width - 1] +
                    2 * norm[i + width] +
                    norm[i + width + 1];

                const g = Math.sqrt(gx * gx + gy * gy);
                edge[i] = g > 40 ? 255 : 0;
            }
        }

        // 4 dilation (склеивание частей букв)
        const morph = new Uint8Array(size);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                let hit = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (edge[(y + dy) * width + (x + dx)]) {
                            hit = 1;
                            break;
                        }
                    }
                    if (hit) break;
                }

                morph[y * width + x] = hit;
            }
        }

        // 5 connected components
        const visited = new Uint8Array(size);
        const symbols = [];

        for (let i = 0; i < size; i++) {
            if (visited[i] || morph[i] === 0) continue;

            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;
            let area = 0;

            const stack = [i];

            while (stack.length) {

                const idx = stack.pop();
                if (visited[idx]) continue;
                if (!morph[idx]) continue;

                visited[idx] = 1;
                area++;

                const x = idx % width;
                const y = (idx / width) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (x > 0) stack.push(idx - 1);
                if (x < width - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - width);
                if (y < height - 1) stack.push(idx + width);
            }

            const w = maxX - minX;
            const h = maxY - minY;
            const ratio = w / (h || 1);

            // фильтр символов
            if (
                area > 40 &&
                w > 5 &&
                h > 10 &&
                ratio > 0.1 &&
                ratio < 1.2
            ) {
                symbols.push({
                    x: minX,
                    y: minY,
                    w,
                    h,
                    cx: minX + w / 2,
                    cy: minY + h / 2
                });
            }
        }

        // 6 группировка в строки
        const lines = [];

        for (const s of symbols) {

            let placed = false;

            for (const line of lines) {
                if (Math.abs(line.y - s.cy) < 20) {
                    line.symbols.push(s);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                lines.push({
                    y: s.cy,
                    symbols: [s]
                });
            }
        }

        // сортировка символов
        for (const line of lines) {
            line.symbols.sort((a, b) => a.x - b.x);
        }

        // рисуем рамки
        for (const line of lines) {
            for (const s of line.symbols) {

                for (let x = s.x; x <= s.x + s.w; x++) {

                    const t = (s.y * width + x) * 4;
                    const b = ((s.y + s.h) * width + x) * 4;

                    data[t] = 255;
                    data[t + 1] = 0;
                    data[t + 2] = 0;

                    data[b] = 255;
                    data[b + 1] = 0;
                    data[b + 2] = 0;
                }

                for (let y = s.y; y <= s.y + s.h; y++) {

                    const l = (y * width + s.x) * 4;
                    const r = (y * width + s.x + s.w) * 4;

                    data[l] = 255;
                    data[l + 1] = 0;
                    data[l + 2] = 0;

                    data[r] = 255;
                    data[r + 1] = 0;
                    data[r + 2] = 0;
                }
            }
        }

        console.log("lines:", lines);
        return lines;
    }
    detectTextSymbols2(width, height, data) {
        const size = width * height;

        // grayscale
        const gray = new Uint8ClampedArray(size);
        for (let i = 0; i < size; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        // adaptive threshold (быстрее чем Otsu для текста)
        const bin = new Uint8Array(size);
        const radius = 8;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                let sum = 0;
                let count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    const ny = y + dy;
                    if (ny < 0 || ny >= height) continue;

                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        if (nx < 0 || nx >= width) continue;

                        sum += gray[ny * width + nx];
                        count++;
                    }
                }

                const avg = sum / count;
                const v = gray[y * width + x];

                bin[y * width + x] = v < avg - 10 ? 1 : 0;
            }
        }

        // морфология (dilation)
        const morph = new Uint8Array(size);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                let hit = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (bin[(y + dy) * width + (x + dx)]) {
                            hit = 1;
                            break;
                        }
                    }
                    if (hit) break;
                }

                morph[y * width + x] = hit;
            }
        }

        // connected components
        const visited = new Uint8Array(size);
        const symbols = [];

        for (let i = 0; i < size; i++) {
            if (visited[i] || morph[i] === 0) continue;

            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;
            let area = 0;

            const stack = [i];

            while (stack.length) {
                const idx = stack.pop();
                if (visited[idx]) continue;
                if (!morph[idx]) continue;

                visited[idx] = 1;
                area++;

                const x = idx % width;
                const y = (idx / width) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (x > 0) stack.push(idx - 1);
                if (x < width - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - width);
                if (y < height - 1) stack.push(idx + width);
            }

            const w = maxX - minX;
            const h = maxY - minY;
            const ratio = w / (h || 1);

            // фильтр похожести на символ
            if (
                area > 30 &&
                w > 3 &&
                h > 8 &&
                ratio > 0.1 &&
                ratio < 1.5
            ) {
                symbols.push({
                    x: minX,
                    y: minY,
                    w,
                    h,
                    cx: minX + w / 2
                });
            }
        }

        // сортировка как текст
        symbols.sort((a, b) => {
            const dy = Math.abs(a.y - b.y);
            if (dy < 10) return a.x - b.x;
            return a.y - b.y;
        });

        // рисуем рамки
        for (const s of symbols) {

            for (let x = s.x; x <= s.x + s.w; x++) {
                const t = (s.y * width + x) * 4;
                const b = ((s.y + s.h) * width + x) * 4;

                data[t] = 255;
                data[t + 1] = 0;
                data[t + 2] = 0;

                data[b] = 255;
                data[b + 1] = 0;
                data[b + 2] = 0;
            }

            for (let y = s.y; y <= s.y + s.h; y++) {
                const l = (y * width + s.x) * 4;
                const r = (y * width + s.x + s.w) * 4;

                data[l] = 255;
                data[l + 1] = 0;
                data[l + 2] = 0;

                data[r] = 255;
                data[r + 1] = 0;
                data[r + 2] = 0;
            }
        }

        console.log("symbols:", symbols);

        return symbols;
    }
    detectSymbolsAdvanced(width, height, data) {
        const size = width * height;

        // --- grayscale
        const gray = new Uint8ClampedArray(size);
        for (let i = 0; i < size; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        // --- усиление контраста
        let min = 255;
        let max = 0;

        for (let i = 0; i < size; i++) {
            const v = gray[i];
            if (v < min) min = v;
            if (v > max) max = v;
        }

        const contrast = new Uint8ClampedArray(size);
        const range = max - min || 1;

        for (let i = 0; i < size; i++) {
            contrast[i] = ((gray[i] - min) / range) * 255;
        }

        // --- Otsu threshold
        const hist = new Array(256).fill(0);
        for (let i = 0; i < size; i++) hist[contrast[i]]++;

        let sum = 0;
        for (let i = 0; i < 256; i++) sum += i * hist[i];

        let sumB = 0;
        let wB = 0;
        let wF = 0;

        let varMax = 0;
        let threshold = 0;

        for (let t = 0; t < 256; t++) {
            wB += hist[t];
            if (wB === 0) continue;

            wF = size - wB;
            if (wF === 0) break;

            sumB += t * hist[t];

            const mB = sumB / wB;
            const mF = (sum - sumB) / wF;

            const between = wB * wF * (mB - mF) * (mB - mF);

            if (between > varMax) {
                varMax = between;
                threshold = t;
            }
        }

        // --- бинаризация
        const bin = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            bin[i] = contrast[i] < threshold ? 1 : 0;
        }

        // --- морфология (закрытие)
        const morph = new Uint8Array(size);

        const r = 1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let hit = 0;

                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                        if (bin[ny * width + nx]) {
                            hit = 1;
                            break;
                        }
                    }
                    if (hit) break;
                }

                morph[y * width + x] = hit;
            }
        }

        // --- поиск компонентов
        const visited = new Uint8Array(size);
        const symbols = [];

        for (let i = 0; i < size; i++) {
            if (visited[i] || morph[i] === 0) continue;

            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;
            let area = 0;

            const stack = [i];

            while (stack.length) {
                const idx = stack.pop();
                if (visited[idx]) continue;
                if (!morph[idx]) continue;

                visited[idx] = 1;
                area++;

                const x = idx % width;
                const y = (idx / width) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (x > 0) stack.push(idx - 1);
                if (x < width - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - width);
                if (y < height - 1) stack.push(idx + width);
            }

            const w = maxX - minX;
            const h = maxY - minY;

            // фильтр символов
            if (area > 40 && w > 4 && h > 8 && w < 120 && h < 120) {
                symbols.push({ minX, minY, maxX, maxY });
            }
        }

        // --- рисуем рамки
        for (const box of symbols) {
            for (let x = box.minX; x <= box.maxX; x++) {
                const t = (box.minY * width + x) * 4;
                const b = (box.maxY * width + x) * 4;

                data[t] = 0;
                data[t + 1] = 255;
                data[t + 2] = 0;

                data[b] = 0;
                data[b + 1] = 255;
                data[b + 2] = 0;
            }

            for (let y = box.minY; y <= box.maxY; y++) {
                const l = (y * width + box.minX) * 4;
                const r = (y * width + box.maxX) * 4;

                data[l] = 0;
                data[l + 1] = 255;
                data[l + 2] = 0;

                data[r] = 0;
                data[r + 1] = 255;
                data[r + 2] = 0;
            }
        }

        console.log("symbols detected:", symbols.length);

        return symbols;
    }
    detectTextLinesAndSymbols(width, height, data) {
        const size = width * height;

        // --- grayscale
        const gray = new Uint8ClampedArray(size);
        for (let i = 0; i < size; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        // --- бинаризация
        const bin = new Uint8Array(size);
        const threshold = 140;

        for (let i = 0; i < size; i++) {
            bin[i] = gray[i] < threshold ? 1 : 0;
        }

        // --- горизонтальная дилатация (соединяем буквы в строки)
        const lineMap = new Uint8Array(bin);

        const radiusX = 6;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let hit = 0;

                for (let dx = -radiusX; dx <= radiusX; dx++) {
                    const nx = x + dx;
                    if (nx < 0 || nx >= width) continue;

                    if (bin[y * width + nx]) {
                        hit = 1;
                        break;
                    }
                }

                lineMap[y * width + x] = hit;
            }
        }

        // --- поиск строк
        const visited = new Uint8Array(size);
        const lines = [];

        for (let i = 0; i < size; i++) {
            if (visited[i] || lineMap[i] === 0) continue;

            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;

            const stack = [i];

            while (stack.length) {
                const idx = stack.pop();
                if (visited[idx]) continue;
                if (!lineMap[idx]) continue;

                visited[idx] = 1;

                const x = idx % width;
                const y = (idx / width) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (x > 0) stack.push(idx - 1);
                if (x < width - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - width);
                if (y < height - 1) stack.push(idx + width);
            }

            const w = maxX - minX;
            const h = maxY - minY;

            if (w > 30 && h > 10) {
                lines.push({ minX, minY, maxX, maxY });
            }
        }

        const symbols = [];

        // --- внутри каждой строки ищем символы
        for (const line of lines) {
            const localVisited = new Uint8Array(size);

            for (let y = line.minY; y <= line.maxY; y++) {
                for (let x = line.minX; x <= line.maxX; x++) {
                    const idx = y * width + x;

                    if (localVisited[idx] || bin[idx] === 0) continue;

                    let minX = x;
                    let maxX = x;
                    let minY = y;
                    let maxY = y;
                    let area = 0;

                    const stack = [idx];

                    while (stack.length) {
                        const id = stack.pop();
                        if (localVisited[id]) continue;
                        if (!bin[id]) continue;

                        localVisited[id] = 1;
                        area++;

                        const px = id % width;
                        const py = (id / width) | 0;

                        if (px < minX) minX = px;
                        if (px > maxX) maxX = px;
                        if (py < minY) minY = py;
                        if (py > maxY) maxY = py;

                        if (px > 0) stack.push(id - 1);
                        if (px < width - 1) stack.push(id + 1);
                        if (py > 0) stack.push(id - width);
                        if (py < height - 1) stack.push(id + width);
                    }

                    const w = maxX - minX;
                    const h = maxY - minY;

                    if (area > 20 && w > 3 && h > 8) {
                        symbols.push({ minX, minY, maxX, maxY });
                    }
                }
            }
        }

        // --- рисуем рамки
        for (const box of symbols) {
            for (let x = box.minX; x <= box.maxX; x++) {
                const t = (box.minY * width + x) * 4;
                const b = (box.maxY * width + x) * 4;

                data[t] = 255;
                data[t + 1] = 0;
                data[t + 2] = 0;

                data[b] = 255;
                data[b + 1] = 0;
                data[b + 2] = 0;
            }

            for (let y = box.minY; y <= box.maxY; y++) {
                const l = (y * width + box.minX) * 4;
                const r = (y * width + box.maxX) * 4;

                data[l] = 255;
                data[l + 1] = 0;
                data[l + 2] = 0;

                data[r] = 255;
                data[r + 1] = 0;
                data[r + 2] = 0;
            }
        }

        console.log("lines:", lines.length);
        console.log("symbols:", symbols.length);

        return symbols;
    }
    detectTextOCR(width, height, data) {
        const size = width * height;

        // --- grayscale
        const gray = new Uint8ClampedArray(size);
        for (let i = 0; i < size; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        // --- adaptive threshold (быстрее)
        const bin = new Uint8Array(size);
        const t = 15;

        for (let i = 0; i < size; i++) {
            bin[i] = gray[i] < 140 - t ? 1 : 0;
        }

        // --- dilation (соединяем части букв)
        const dilated = new Uint8Array(bin);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let hit = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (bin[(y + dy) * width + (x + dx)]) {
                            hit = 1;
                            break;
                        }
                    }
                    if (hit) break;
                }

                dilated[y * width + x] = hit;
            }
        }

        // --- erosion (убираем шум)
        const morph = new Uint8Array(dilated);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let count = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dilated[(y + dy) * width + (x + dx)]) count++;
                    }
                }

                if (count < 3) morph[y * width + x] = 0;
            }
        }

        // --- connected components
        const visited = new Uint8Array(size);
        const symbols = [];

        for (let i = 0; i < size; i++) {
            if (visited[i] || morph[i] === 0) continue;

            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;
            let area = 0;

            const stack = [i];

            while (stack.length) {
                const idx = stack.pop();
                if (visited[idx]) continue;
                if (!morph[idx]) continue;

                visited[idx] = 1;
                area++;

                const x = idx % width;
                const y = (idx / width) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (x > 0) stack.push(idx - 1);
                if (x < width - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - width);
                if (y < height - 1) stack.push(idx + width);
            }

            const w = maxX - minX;
            const h = maxY - minY;

            // фильтр символов
            if (
                area > 30 &&
                w > 3 &&
                h > 10 &&
                h < 300 &&
                w < 200 &&
                h > w * 0.6
            ) {
                symbols.push({ minX, minY, maxX, maxY });
            }
        }

        // --- рисуем найденные символы
        for (const box of symbols) {
            for (let x = box.minX; x <= box.maxX; x++) {
                const t = (box.minY * width + x) * 4;
                const b = (box.maxY * width + x) * 4;

                data[t] = 255;
                data[t + 1] = 0;
                data[t + 2] = 0;

                data[b] = 255;
                data[b + 1] = 0;
                data[b + 2] = 0;
            }

            for (let y = box.minY; y <= box.maxY; y++) {
                const l = (y * width + box.minX) * 4;
                const r = (y * width + box.maxX) * 4;

                data[l] = 255;
                data[l + 1] = 0;
                data[l + 2] = 0;

                data[r] = 255;
                data[r + 1] = 0;
                data[r + 2] = 0;
            }
        }

        console.log("symbols detected:", symbols.length);
        return symbols;
    }
    /** Process each pixel, comparing it to the previous one */
    processPixels2(data) {
        let prevVec = null;          // previous RGB vector
        let buoy = 0;                 // previous cosine similarity
        console.log(data);
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            const currVec = [r, g, b];

            if (prevVec === null) {
                // First pixel – nothing to compare with
                prevVec = currVec;
                continue;
            }

            const compere = this.cosineSimilarity(prevVec, currVec); // [-1, 1]

            // Map similarity to [0,255] (inverse if similarity decreased)
            const gray = compere > buoy
                ? this.mapCosineTo255(compere)
                : this.mapCosineTo255Inverted(compere);

            // Write the grayscale value back to R,G,B
            //data[i] = gray;
            //data[i + 1] = gray;
            //data[i + 2] = gray;
            //data[i + 3] = a; // keep original alpha

            //130 140 140


            const v = {
                //max: [137, 148, 158],
                //min: [113, 110, 126],
                max: [75, 192, 47],
                min: [51, 140, 16],
            }
            //const dcolor = this.deltaColorSize3(v.max, v.min);

            const dcolor = [
                Math.abs(v.max[0] - v.min[0]),
                Math.abs(v.max[1] - v.min[1]),
                Math.abs(v.max[2] - v.min[2])
            ];
            const dR = dcolor[0]; // порог по красному
            const dG = dcolor[1]; // порог по зеленому
            const dB = dcolor[2]; // порог по синему

            //const dr = Math.abs(r - 126);
            //const dg = Math.abs(g - 133);
            //const db = Math.abs(b - 128.5);


            const dr = Math.abs(r - (v.min[0] + dR / 2));
            const dg = Math.abs(g - (v.min[1] + dG / 2));
            const db = Math.abs(b - (v.min[2] + dB / 2));


            if (dr < dR && dg < dG && db < dB) {
                data[i] = 0;// r;
                data[i + 1] = 0;// g;
                data[i + 2] = 0;// b;
                data[i + 3] = a;
            } else {
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
                data[i + 3] = a;

            }





            //data[i] = r;
            //data[i + 1] = g;
            //data[i + 2] = b;
            //data[i + 3] = a; // keep original alpha

            // Update state for next iteration
            buoy = compere;
            prevVec = currVec;
        }
    }
    processPixels(data) {
        let prevVec = null;          // previous RGB vector
        let buoy = 0;                 // previous cosine similarity
        console.log(data);
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            const currVec = [r, g, b];

            if (prevVec === null) {
                // First pixel – nothing to compare with
                prevVec = currVec;
                continue;
            }

            const compere = this.cosineSimilarity(prevVec, currVec); // [-1, 1]

            // Map similarity to [0,255] (inverse if similarity decreased)
            const gray = compere > buoy
                ? this.mapCosineTo255(compere)
                : this.mapCosineTo255Inverted(compere);

            // Write the grayscale value back to R,G,B
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            data[i + 3] = a; // keep original alpha




            //data[i] = r;
            //data[i + 1] = g;
            //data[i + 2] = b;
            //data[i + 3] = a; // keep original alpha

            // Update state for next iteration
            buoy = compere;
            prevVec = currVec;
        }
    }
    processPixelsDeltaRGB(data) {
        let prev = null;

        const dR = 23; // порог по красному
        const dG = 18; // порог по зеленому
        const dB = 7; // порог по синему

        let regionId = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            const curr = [r, g, b];

            if (prev === null) {
                prev = curr;
                continue;
            }

            const dr = Math.abs(curr[0] - prev[0]);
            const dg = Math.abs(curr[1] - prev[1]);
            const db = Math.abs(curr[2] - prev[2]);

            const sameRegion = (dr <= dR && dg <= dG && db <= dB);

            if (!sameRegion) {
                regionId++;
            }

            // цвет области (для визуализации)
            const gray = (regionId * 37) % 255;

            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            data[i + 3] = a;

            prev = curr;
        }
    }
    processPixelsRange(data) {
        let prevVec = null;   // previous RGB vector
        let buoy = 0;         // previous cosine similarity

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            const currVec = [r, g, b];

            if (prevVec === null) {
                prevVec = currVec;
                continue;
            }

            const compere = this.cosineSimilarity(prevVec, currVec); // [-1, 1]

            // Apply range deviation (tolerance)
            const delta = Math.abs(compere - buoy);
            let gray;
            if (delta <= this.rangeDeviation) {
                // No significant change → neutral gray
                gray = 128;
            } else {
                // Keep original mapping: lighter if similarity increased,
                // darker if it decreased
                gray = compere > buoy
                    ? this.mapCosineTo255(compere)
                    : this.mapCosineTo255Inverted(compere);
            }

            // Write the grayscale value back to R,G,B
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            data[i + 3] = a; // keep original alpha

            // Update state for next iteration
            buoy = compere;
            prevVec = currVec;
        }
    }
    autoSegmentKMeans(width, height, data) {
        const k = 6; // количество цветов (можно менять 4–10)
        const pixels = [];

        for (let i = 0; i < data.length; i += 4) {
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }

        // случайные центры
        let centers = [];
        for (let i = 0; i < k; i++) {
            const p = pixels[Math.floor(Math.random() * pixels.length)];
            centers.push([...p]);
        }

        const distance = (a, b) =>
            (a[0] - b[0]) ** 2 +
            (a[1] - b[1]) ** 2 +
            (a[2] - b[2]) ** 2;

        for (let iter = 0; iter < 10; iter++) {
            const groups = Array.from({ length: k }, () => ({
                sum: [0, 0, 0],
                count: 0
            }));

            // распределение пикселей
            for (let i = 0; i < pixels.length; i++) {
                let best = 0;
                let bestDist = Infinity;

                for (let c = 0; c < k; c++) {
                    const d = distance(pixels[i], centers[c]);
                    if (d < bestDist) {
                        bestDist = d;
                        best = c;
                    }
                }

                groups[best].sum[0] += pixels[i][0];
                groups[best].sum[1] += pixels[i][1];
                groups[best].sum[2] += pixels[i][2];
                groups[best].count++;
            }

            // обновление центров
            for (let c = 0; c < k; c++) {
                if (groups[c].count === 0) continue;

                centers[c] = [
                    groups[c].sum[0] / groups[c].count,
                    groups[c].sum[1] / groups[c].count,
                    groups[c].sum[2] / groups[c].count
                ];
            }
        }

        // раскраска по кластерам
        let idx = 0;
        for (let i = 0; i < data.length; i += 4) {
            const p = pixels[idx++];

            let best = 0;
            let bestDist = Infinity;

            for (let c = 0; c < k; c++) {
                const d = distance(p, centers[c]);
                if (d < bestDist) {
                    bestDist = d;
                    best = c;
                }
            }

            const color = centers[best];

            data[i] = color[0];
            data[i + 1] = color[1];
            data[i + 2] = color[2];
        }

        console.log("centers:", centers);
    }
    segmentColorRegions(width, height, data) {
        const visited = new Uint8Array(width * height);

        // пороги цвета
        const dR = 20;
        const dG = 20;
        const dB = 20;

        const getIndex = (x, y) => y * width + x;

        // копия оригинальных цветов
        const original = new Uint8ClampedArray(data);

        let region = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const start = getIndex(x, y);
                if (visited[start]) continue;

                region++;

                const stack = [start];

                while (stack.length) {
                    const idx = stack.pop();
                    if (visited[idx]) continue;

                    visited[idx] = 1;

                    const i = idx * 4;

                    const r = original[i];
                    const g = original[i + 1];
                    const b = original[i + 2];

                    // цвет области (визуализация)
                    const color = (region * 83) % 255;

                    data[i] = color;
                    data[i + 1] = color;
                    data[i + 2] = color;

                    const px = idx % width;
                    const py = (idx / width) | 0;

                    const neighbors = [
                        [px + 1, py],
                        [px - 1, py],
                        [px, py + 1],
                        [px, py - 1],
                    ];

                    for (let k = 0; k < neighbors.length; k++) {
                        const nx = neighbors[k][0];
                        const ny = neighbors[k][1];

                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                        const nIdx = getIndex(nx, ny);
                        if (visited[nIdx]) continue;

                        const ni = nIdx * 4;

                        const nr = original[ni];
                        const ng = original[ni + 1];
                        const nb = original[ni + 2];

                        const dr = Math.abs(r - nr);
                        const dg = Math.abs(g - ng);
                        const db = Math.abs(b - nb);

                        if (dr <= dR && dg <= dG && db <= dB) {
                            stack.push(nIdx);
                        }
                    }
                }
            }
        }

        console.log("regions:", region);
    }
    segmentImageAdvanced(width, height, data) {
        const k = 2; // количество основных цветов
        const pixelCount = width * height;

        // массив пикселей
        const pixels = new Array(pixelCount);
        for (let i = 0; i < pixelCount; i++) {
            const p = i * 4;
            pixels[i] = [data[p], data[p + 1], data[p + 2]];
        }

        // --- KMEANS ---
        let centers = [];
        for (let i = 0; i < k; i++) {
            centers.push([...pixels[Math.floor(Math.random() * pixelCount)]]);
        }

        const dist = (a, b) =>
            (a[0] - b[0]) ** 2 +
            (a[1] - b[1]) ** 2 +
            (a[2] - b[2]) ** 2;

        for (let iter = 0; iter < 8; iter++) {
            const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);

            for (let i = 0; i < pixelCount; i++) {
                let best = 0;
                let bestD = Infinity;

                for (let c = 0; c < k; c++) {
                    const d = dist(pixels[i], centers[c]);
                    if (d < bestD) {
                        bestD = d;
                        best = c;
                    }
                }

                sums[best][0] += pixels[i][0];
                sums[best][1] += pixels[i][1];
                sums[best][2] += pixels[i][2];
                sums[best][3]++;
            }

            for (let c = 0; c < k; c++) {
                if (sums[c][3] === 0) continue;
                centers[c] = [
                    sums[c][0] / sums[c][3],
                    sums[c][1] / sums[c][3],
                    sums[c][2] / sums[c][3]
                ];
            }
        }

        // назначаем кластер каждому пикселю
        const clusterMap = new Uint8Array(pixelCount);

        for (let i = 0; i < pixelCount; i++) {
            let best = 0;
            let bestD = Infinity;

            for (let c = 0; c < k; c++) {
                const d = dist(pixels[i], centers[c]);
                if (d < bestD) {
                    bestD = d;
                    best = c;
                }
            }

            clusterMap[i] = best;
        }

        // --- REGION GROWING ---
        const visited = new Uint8Array(pixelCount);
        const getIndex = (x, y) => y * width + x;

        let regionId = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const start = getIndex(x, y);
                if (visited[start]) continue;

                regionId++;
                const cluster = clusterMap[start];

                const stack = [start];

                while (stack.length) {
                    const idx = stack.pop();
                    if (visited[idx]) continue;
                    if (clusterMap[idx] !== cluster) continue;

                    visited[idx] = 1;

                    const p = idx * 4;
                    const color = (regionId * 73) % 255;

                    data[p] = color;
                    data[p + 1] = color;
                    data[p + 2] = color;

                    const px = idx % width;
                    const py = (idx / width) | 0;

                    const neighbors = [
                        [px + 1, py],
                        [px - 1, py],
                        [px, py + 1],
                        [px, py - 1]
                    ];

                    for (let i = 0; i < neighbors.length; i++) {
                        const nx = neighbors[i][0];
                        const ny = neighbors[i][1];

                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                        const nIdx = getIndex(nx, ny);
                        if (!visited[nIdx]) {
                            stack.push(nIdx);
                        }
                    }
                }
            }
        }

        console.log("regions:", regionId);
        console.log("colors:", centers);
    }
    detectTextSymbols(width, height, data) {
        const pixelCount = width * height;

        // --- grayscale
        const gray = new Uint8ClampedArray(pixelCount);

        for (let i = 0; i < pixelCount; i++) {
            const p = i * 4;
            gray[i] =
                data[p] * 0.299 +
                data[p + 1] * 0.587 +
                data[p + 2] * 0.114;
        }

        // --- адаптивная бинаризация
        const bin = new Uint8Array(pixelCount);
        const window = 15;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let count = 0;

                for (let dy = -window; dy <= window; dy++) {
                    const ny = y + dy;
                    if (ny < 0 || ny >= height) continue;

                    for (let dx = -window; dx <= window; dx++) {
                        const nx = x + dx;
                        if (nx < 0 || nx >= width) continue;

                        sum += gray[ny * width + nx];
                        count++;
                    }
                }

                const mean = sum / count;
                const i = y * width + x;

                bin[i] = gray[i] < mean - 10 ? 1 : 0;
            }
        }

        // --- удаление шума
        const clean = new Uint8Array(bin);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let neighbors = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (bin[(y + dy) * width + (x + dx)]) neighbors++;
                    }
                }

                const i = y * width + x;

                if (neighbors < 2) clean[i] = 0;
            }
        }

        // --- connected components
        const visited = new Uint8Array(pixelCount);
        const boxes = [];

        for (let i = 0; i < pixelCount; i++) {
            if (visited[i] || clean[i] === 0) continue;

            let minX = width;
            let minY = height;
            let maxX = 0;
            let maxY = 0;
            let area = 0;

            const stack = [i];

            while (stack.length) {
                const idx = stack.pop();
                if (visited[idx]) continue;
                if (!clean[idx]) continue;

                visited[idx] = 1;
                area++;

                const x = idx % width;
                const y = (idx / width) | 0;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                if (x > 0) stack.push(idx - 1);
                if (x < width - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - width);
                if (y < height - 1) stack.push(idx + width);
            }

            const w = maxX - minX;
            const h = maxY - minY;

            // фильтр символов
            if (
                area > 20 &&
                w > 3 &&
                h > 8 &&
                h < 200 &&
                w < 200 &&
                h > w * 0.5
            ) {
                boxes.push({ minX, minY, maxX, maxY });
            }
        }

        // рисуем рамки
        for (const box of boxes) {
            for (let x = box.minX; x <= box.maxX; x++) {
                let top = (box.minY * width + x) * 4;
                let bottom = (box.maxY * width + x) * 4;

                data[top] = 255;
                data[top + 1] = 0;
                data[top + 2] = 0;

                data[bottom] = 255;
                data[bottom + 1] = 0;
                data[bottom + 2] = 0;
            }

            for (let y = box.minY; y <= box.maxY; y++) {
                let left = (y * width + box.minX) * 4;
                let right = (y * width + box.maxX) * 4;

                data[left] = 255;
                data[left + 1] = 0;
                data[left + 2] = 0;

                data[right] = 255;
                data[right + 1] = 0;
                data[right + 2] = 0;
            }
        }

        console.log("symbols:", boxes.length);
        return boxes;
    }
    detectSymbols(width, height, data) {
        const gray = new Uint8ClampedArray(width * height);

        // grayscale
        for (let i = 0; i < gray.length; i++) {
            const p = i * 4;
            gray[i] = (data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114) | 0;
        }

        // edge detection (простая разница)
        const edge = new Uint8Array(width * height);

        const threshold = 25;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;

                const gx = Math.abs(gray[i] - gray[i + 1]);
                const gy = Math.abs(gray[i] - gray[i + width]);

                edge[i] = (gx + gy) > threshold ? 1 : 0;
            }
        }

        // connected components
        const visited = new Uint8Array(width * height);
        const boxes = [];

        const getIndex = (x, y) => y * width + x;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const start = getIndex(x, y);

                if (visited[start] || edge[start] === 0) continue;

                let minX = x;
                let maxX = x;
                let minY = y;
                let maxY = y;

                const stack = [start];

                while (stack.length) {
                    const idx = stack.pop();
                    if (visited[idx]) continue;
                    if (edge[idx] === 0) continue;

                    visited[idx] = 1;

                    const px = idx % width;
                    const py = (idx / width) | 0;

                    if (px < minX) minX = px;
                    if (px > maxX) maxX = px;
                    if (py < minY) minY = py;
                    if (py > maxY) maxY = py;

                    if (px > 0) stack.push(idx - 1);
                    if (px < width - 1) stack.push(idx + 1);
                    if (py > 0) stack.push(idx - width);
                    if (py < height - 1) stack.push(idx + width);
                }

                const w = maxX - minX;
                const h = maxY - minY;

                // фильтр символов
                if (w > 5 && h > 8 && w < 120 && h < 120) {
                    boxes.push({ minX, minY, maxX, maxY });
                }
            }
        }

        // рисуем найденные символы
        for (const box of boxes) {
            for (let x = box.minX; x <= box.maxX; x++) {
                const top = (box.minY * width + x) * 4;
                const bottom = (box.maxY * width + x) * 4;

                data[top] = 255;
                data[top + 1] = 0;
                data[top + 2] = 0;

                data[bottom] = 255;
                data[bottom + 1] = 0;
                data[bottom + 2] = 0;
            }

            for (let y = box.minY; y <= box.maxY; y++) {
                const left = (y * width + box.minX) * 4;
                const right = (y * width + box.maxX) * 4;

                data[left] = 255;
                data[left + 1] = 0;
                data[left + 2] = 0;

                data[right] = 255;
                data[right + 1] = 0;
                data[right + 2] = 0;
            }
        }

        console.log("symbols found:", boxes.length);
        return boxes;
    }
    segmentImagePro(width, height, data) {
        const pixelCount = width * height;

        // --- сглаживание (очень ускоряет и улучшает сегментацию)
        const smooth = new Uint8ClampedArray(data);

        const getIndex = (x, y) => (y * width + x) * 4;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let r = 0, g = 0, b = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const i = getIndex(x + dx, y + dy);
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                    }
                }

                const i = getIndex(x, y);
                smooth[i] = r / 9;
                smooth[i + 1] = g / 9;
                smooth[i + 2] = b / 9;
            }
        }

        // --- KMEANS
        const k = 6;
        let centers = [];

        for (let i = 0; i < k; i++) {
            const p = Math.floor(Math.random() * pixelCount) * 4;
            centers.push([smooth[p], smooth[p + 1], smooth[p + 2]]);
        }

        const dist = (r, g, b, c) =>
            (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;

        for (let iter = 0; iter < 6; iter++) {
            const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);

            for (let i = 0; i < pixelCount; i++) {
                const p = i * 4;

                const r = smooth[p];
                const g = smooth[p + 1];
                const b = smooth[p + 2];

                let best = 0;
                let bestD = Infinity;

                for (let c = 0; c < k; c++) {
                    const d = dist(r, g, b, centers[c]);
                    if (d < bestD) {
                        bestD = d;
                        best = c;
                    }
                }

                sums[best][0] += r;
                sums[best][1] += g;
                sums[best][2] += b;
                sums[best][3]++;
            }

            for (let c = 0; c < k; c++) {
                if (sums[c][3] === 0) continue;

                centers[c] = [
                    sums[c][0] / sums[c][3],
                    sums[c][1] / sums[c][3],
                    sums[c][2] / sums[c][3]
                ];
            }
        }

        // карта кластеров
        const cluster = new Uint8Array(pixelCount);

        for (let i = 0; i < pixelCount; i++) {
            const p = i * 4;

            const r = smooth[p];
            const g = smooth[p + 1];
            const b = smooth[p + 2];

            let best = 0;
            let bestD = Infinity;

            for (let c = 0; c < k; c++) {
                const d = dist(r, g, b, centers[c]);
                if (d < bestD) {
                    bestD = d;
                    best = c;
                }
            }

            cluster[i] = best;
        }

        // --- поиск областей
        const visited = new Uint8Array(pixelCount);
        let region = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const start = y * width + x;
                if (visited[start]) continue;

                const stack = [start];
                const cl = cluster[start];
                region++;

                while (stack.length) {
                    const idx = stack.pop();
                    if (visited[idx]) continue;
                    if (cluster[idx] !== cl) continue;

                    visited[idx] = 1;

                    const p = idx * 4;
                    const color = (region * 61) % 255;

                    data[p] = color;
                    data[p + 1] = color;
                    data[p + 2] = color;

                    const px = idx % width;
                    const py = (idx / width) | 0;

                    if (px > 0) stack.push(idx - 1);
                    if (px < width - 1) stack.push(idx + 1);
                    if (py > 0) stack.push(idx - width);
                    if (py < height - 1) stack.push(idx + width);
                }
            }
        }

        console.log("regions:", region);
    }
    /** Scale similarity from [-1,1] → [0,255] */
    mapCosineTo255(s) {
        return Math.round(((s + 1) / 2) * 255);
    }

    /** Inverse mapping: similarity decreased → darker */
    mapCosineTo255Inverted(s) {
        return Math.round(((1 - s) / 2) * 255);
    }

    /** Cosine similarity between two RGB vectors */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) throw new Error('Векторы должны иметь одинаковую длину.');

        let dot = 0;
        for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];

        const normA = Math.sqrt(vecA.reduce((s, v) => s + v * v, 0));
        const normB = Math.sqrt(vecB.reduce((s, v) => s + v * v, 0));

        if (normA === 0 || normB === 0) return 0; // avoid division by zero

        return dot / (normA * normB);
    }
}
//// Класс для управления приложением
class WordClassificationApp {
    constructor() {
        this.network = null;
        this.categories = {};
        this.categoryColors = {};
        this.trainingData = [];
        this.isTraining = false;


        this.heatmaps = [];
        this.ctxHeatmap = [];

        this.globalCharEmbeddings = null;

        this.dataset = [];
        this.initializeUI();


    }

    // Инициализация интерфейса
    async initializeUI() {
        // Элементы интерфейса
        this.architectureInput = document.getElementById('architectureInput');
        this.learningRateInput = document.getElementById('learningRateInput');
        this.epochsInput = document.getElementById('epochsInput');
        this.initNetworkBtn = document.getElementById('initNetworkBtn');
        this.networkStatus = document.getElementById('networkStatus');

        this.categoryInput = document.getElementById('categoryInput');
        this.wordInput = document.getElementById('wordInput');
        this.addWordBtn = document.getElementById('addWordBtn');
        this.categoriesContainer = document.getElementById('categoriesContainer');

        this.trainBtn = document.getElementById('trainBtn');
        this.trainingProgress = document.getElementById('trainingProgress');
        this.newWordsInput = document.getElementById('newWordsInput');
        this.classifyBtn = document.getElementById('classifyBtn');
        this.classificationResults = document.getElementById('classificationResults');

        this.canvas = document.getElementById('visualization');
        this.ctx = this.canvas.getContext('2d');
        this.legend = document.getElementById('legend');

        this.heatmap = document.getElementById('heatmap');
        this.spaceOS = document.getElementById('fileInput');
        //this.ctxHeatmap = this.canvasHeatmap.getContext('2d');




        // Обработчики событий
        this.initNetworkBtn.addEventListener('click', () => this.initializeNetwork());
        this.addWordBtn.addEventListener('click', () => this.addWordToCategory());
        this.trainBtn.addEventListener('click', () => this.trainNetwork());
        this.classifyBtn.addEventListener('click', () => this.classifyWords());
        //this.spaceOS.addEventListener('change', (e) => this.loadDataSet(e));

        //this.checkWebGPUSupport();
        //await this.getDataHH();
        await this.initializeWithExamples();
        this.updateVisualization();





        //this.webgpuToggle = document.getElementById('webgpu-toggle');
        //this.webgpuToggle.addEventListener('change', () => {
        //    if (this.network) {
        //        this.initializeNetwork(); // Переинициализируем сеть с новыми настройками
        //    }
        //});

        //this.checkWebGPUSupport();
        //await this.initializeWithExamples();
        //this.updateVisualization();
    }
    //checkWebGPUSupport() {
    //    const webgpuStatus = document.getElementById('webgpu-status');
    //    const webgpuToggle = document.getElementById('webgpu-toggle');

    //    if (!navigator.gpu) {
    //        webgpuStatus.innerHTML = 'WebGPU не поддерживается в вашем браузере';
    //        webgpuStatus.className = 'status-info gpu-unavailable';
    //        webgpuToggle.disabled = true;
    //        return;
    //    }

    //    // Проверяем доступность
    //    navigator.gpu.requestAdapter().then(adapter => {
    //        if (adapter) {
    //            webgpuStatus.innerHTML = 'WebGPU доступен! Можно включить ускорение';
    //            webgpuStatus.className = 'status-info gpu-available';
    //        } else {
    //            webgpuStatus.innerHTML = 'WebGPU адаптер недоступен';
    //            webgpuStatus.className = 'status-info gpu-unavailable';
    //            webgpuToggle.disabled = true;
    //        }
    //    }).catch(error => {
    //        webgpuStatus.innerHTML = `Ошибка WebGPU: ${ error.message } `;
    //        webgpuStatus.className = 'status-info gpu-unavailable';
    //        webgpuToggle.disabled = true;
    //    });
    //}
    checkWebGPUSupport() {
        const webgpuStatus = document.getElementById('webgpu-status');
        const webgpuToggle = document.getElementById('webgpu-toggle');

        if (!navigator.gpu) {
            webgpuStatus.innerHTML = 'WebGPU не поддерживается в вашем браузере';
            webgpuStatus.className = 'status-info gpu-unavailable';
            webgpuToggle.disabled = true;
            webgpuToggle.checked = false;
            return false;
        }

        // Проверяем доступность
        navigator.gpu.requestAdapter().then(adapter => {
            if (adapter) {
                webgpuStatus.innerHTML = 'WebGPU доступен! Можно включить ускорение';
                webgpuStatus.className = 'status-info gpu-available';
                webgpuToggle.disabled = false;
                return true;
            } else {
                webgpuStatus.innerHTML = 'WebGPU адаптер недоступен';
                webgpuStatus.className = 'status-info gpu-unavailable';
                webgpuToggle.disabled = true;
                webgpuToggle.checked = false;
                return false;
            }
        }).catch(error => {
            webgpuStatus.innerHTML = `Ошибка WebGPU: ${error.message} `;
            webgpuStatus.className = 'status-info gpu-unavailable';
            webgpuToggle.disabled = true;
            webgpuToggle.checked = false;
            return false;
        });
    }


    // Инициализация нейронной сети
    initializeNetwork() {
        const architecture = this.architectureInput.value
            .split(',')
            .map(layer => parseInt(layer.trim()));

        const learningRate = parseFloat(this.learningRateInput.value);

        if (architecture.some(isNaN) || isNaN(learningRate)) {
            alert('Пожалуйста, введите корректные параметры сети');
            return;
        }

        // Добавляем размер входного слоя (64 - размер вектора слова)
        architecture.unshift(64);

        // Добавляем размер выходного слоя (количество категорий)
        const numCategories = Object.keys(this.categories).length;
        architecture.push(numCategories > 0 ? numCategories : 2);

        this.network = new NeuralNetwork(architecture, learningRate);
        this.networkStatus.innerHTML = `< p > Сеть инициализирована: ${architecture.join(' → ')}</p > `;




        for (let i = 0; i < architecture.length; i++) {
            this.heatmaps[i] = document.createElement("canvas");
            this.heatmaps[i].style.imageRendering = 'pixelated';
            this.ctxHeatmap[i] = this.heatmaps[i].getContext('2d');
            this.heatmap.appendChild(this.heatmaps[i]);
        }

    }
    //async initGPU() {
    //    if (!navigator.gpu) {
    //        throw new Error('WebGPU не поддерживается');
    //    }

    //    const adapter = await navigator.gpu.requestAdapter();
    //    if (!adapter) {
    //        throw new Error('Не удалось получить GPU адаптер');
    //    }

    //    const device = await adapter.requestDevice();
    //    return device;
    //}
    //async initializeNetwork() {
    //    const architecture = this.architectureInput.value
    //        .split(',')
    //        .map(layer => parseInt(layer.trim()));

    //    const learningRate = parseFloat(this.learningRateInput.value);

    //    if (architecture.some(isNaN) || isNaN(learningRate)) {
    //        alert('Пожалуйста, введите корректные параметры сети');
    //        return;
    //    }

    //    // Добавляем размер входного слоя (64 - размер вектора слова)
    //    architecture.unshift(64);

    //    // Добавляем размер выходного слоя (количество категорий)
    //    const numCategories = Object.keys(this.categories).length;
    //    architecture.push(numCategories > 0 ? numCategories : 2);

    //    try {
    //        // Инициализируем WebGPU устройство
    //        const device = await this.initGPU();

    //        // Создаем сеть с WebGPU ускорением
    //        this.network = new WebGPUNeuralNetwork(architecture, learningRate, device);

    //        this.networkStatus.innerHTML = `< p > WebGPU сеть инициализирована: ${ architecture.join(' → ') }</p > `;
    //    } catch (error) {
    //        console.warn('WebGPU недоступен, используем CPU версию:', error);
    //        this.network = new NeuralNetwork(architecture, learningRate);
    //        this.networkStatus.innerHTML = `< p > CPU сеть инициализирована: ${ architecture.join(' → ') }</p > `;
    //    }

    //    for (let i = 0; i < architecture.length; i++) {
    //        this.heatmaps[i] = document.createElement("canvas");
    //        this.heatmaps[i].style.imageRendering = 'pixelated';
    //        this.ctxHeatmap[i] = this.heatmaps[i].getContext('2d');
    //        this.heatmap.appendChild(this.heatmaps[i]);
    //    }
    //}

    async loadDataSet(e) {
        const file = e.target.files[0];

        if (!file) return; // если файл не выбран

        if (!file.name.endsWith('.json')) {
            document.getElementById('output').textContent = 'Пожалуйста, выберите JSON-файл.';
            return;
        }

        const reader = new FileReader();

        //Use arrow function to preserve 'this' context
        reader.onload = async (event) => {
            try {
                const content = event.target.result;
                const items = JSON.parse(content); // Парсим JSON

                if (!this.dataset) this.dataset = [];

                for (let i = 0; i < items.length; i++) {
                    const obj = {
                        name: items[i].name,
                        working_hours: items[i].working_hours?.[0]?.name || "",
                        work_schedule_by_days: items[i].work_schedule_by_days?.[0]?.name || "",
                        requirement: items[i].snippet?.requirement || "",
                        responsibility: items[i].snippet?.responsibility || "",
                        schedule: items[i].schedule?.name || "",
                        salary_from: items[i].salary_range?.from || "",
                        salary_to: items[i].salary_range?.to || items[i].salary_range?.from || "",
                        frequency: items[i].salary_range?.frequency?.name || "",
                        currency: items[i].salary_range?.currency || "",
                        experience: items[i].salary_range?.experience?.name || "",
                    };
                    this.dataset.push(obj);
                }

                console.log('Loaded items:', items);
                console.log('Dataset size:', this.dataset.length);

                // Await initialization
                await this.initializeWithExamples();

            } catch (err) {
                document.getElementById('output').textContent = 'Ошибка при парсинге JSON: ' + err.message;
                console.error('JSON parsing error:', err);
            }
        };

        //Read as text
        reader.readAsText(file);
    }
    async getDataHH() {
        try {
            const response = await fetch('/hh.json'); // Путь к файлу
            console.log(response);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText} `);
            }

            const items = await response.json(); // Парсим JSON
            console.log(items);
            //let grafic = new Set();
            for (let i = 0; i < items.length; i++) {
                const obj = {
                    name: items[i].name,
                    working_hours: items[i].working_hours[0]?.name,
                    work_schedule_by_days: items[i].work_schedule_by_days[0]?.name,
                    requirement: items[i].snippet.requirement,
                    responsibility: items[i].snippet.responsibility,
                    schedule: items[i].schedule.name,
                    salary_from: items[i].salary_range?.from || "",
                    salary_to: items[i].salary_range?.to || items[i].salary_range?.from || "",
                    frequency: items[i].salary_range?.frequency?.name || "",
                    currency: items[i].salary_range?.currency || "",
                    experience: items[i].salary_range?.experience?.name || "",
                }
                //vectorL.add(JSON.stringify(obj).length);
                this.dataset.push(obj);
            }
            // Выводим красиво отформатированный JSON
            //resultDiv.textContent = JSON.stringify(items, null, 2);
            //console.log(setVacancies);
            //console.log(grafic);
        } catch (error) {
            //resultDiv.textContent = `Ошибка: ${ error.message } `;
            console.error('Ошибка загрузки JSON:', error);
        }
    };

    // Создание вектора для слова
    //createWordVector(word) {
    //    const vector = new Array(64).fill(0);
    //    const normalizedWord = word.toLowerCase().replace(/[^a-z]/g, '');

    //    // Используем хэширование для создания более богатого вектора
    //    for (let i = 0; i < normalizedWord.length; i++) {
    //        const charCode = normalizedWord.charCodeAt(i) - 97; // 'a' = 0
    //        if (charCode >= 0 && charCode < 26) {
    //            // Распределяем влияние символа по нескольким измерениям
    //            const index1 = charCode;
    //            const index2 = (charCode + i) % 64;
    //            const index3 = (charCode * i) % 64;

    //            vector[index1] += 0.5 / normalizedWord.length;
    //            vector[index2] += 0.3 / normalizedWord.length;
    //            vector[index3] += 0.2 / normalizedWord.length;
    //        }
    //    }
    //    console.log(vector);
    //    return vector;
    //}

    //createWordVector(word) {
    //    const alphabet = 'abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    //    const charToIndex = {};
    //    for (let i = 0; i < alphabet.length; i++) {
    //        charToIndex[alphabet[i]] = i;
    //    }

    //    const vector = new Array(64).fill(0);
    //    const normalizedWord = word.toLowerCase().replace(/[^a-zа-яё]/g, '');

    //    if (normalizedWord.length === 0) return vector;

    //    for (let i = 0; i < normalizedWord.length; i++) {
    //        const char = normalizedWord[i];
    //        const charCode = charToIndex[char];
    //        if (charCode === undefined) continue;

    //        const index1 = charCode % 64;
    //        const index2 = (charCode + i) % 64;
    //        const index3 = (charCode * (i + 1)) % 64; // +1 для избежания 0 при i=0

    //        const weight = 1 / normalizedWord.length;

    //        vector[index1] += 0.5 * weight;
    //        vector[index2] += 0.3 * weight;
    //        vector[index3] += 0.2 * weight;
    //    }
    //    const sumOfSquares = vector.reduce((sum, val) => sum + val * val, 0);
    //    const norm = Math.sqrt(sumOfSquares);

    //    if (norm > 1e-10) { // Избегаем деления на ноль (с учётом погрешности)
    //        for (let i = 0; i < vector.length; i++) {
    //            vector[i] /= norm;
    //        }
    //    }

    //    return vector;
    //}
    initializeCharEmbeddings() {
        const russian = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
        const english = "abcdefghijklmnopqrstuvwxyz";
        const number = "0123456789+-'";
        const alphabet = russian + english + number;
        const embeddingDim = 64;

        // Инициализируем только один раз
        if (!this.globalCharEmbeddings) {
            this.globalCharEmbeddings = {};
            alphabet.split('').forEach(char => {
                this.globalCharEmbeddings[char] = Array(embeddingDim).fill().map(() =>
                    (Math.random() - 0.5) * 0.1
                );
            });
        }

        return { alphabet, embeddingDim };
    }
    createWordVector(word) {
        //console.log(word);
        const { embeddingDim } = this.initializeCharEmbeddings();
        //this.Embeddings = embeddingDim;
        //console.log(embeddingDim);
        const vector = Array(embeddingDim).fill(0);
        word += "";
        const normalizedWord = word.toLowerCase().replace(/[^a-zа-яё0-9+'-]/g, ' ');

        if (normalizedWord.length === 0) return vector;
        //console.log(normalizedWord);
        //console.log(normalizedWord.length);
        for (let char of normalizedWord) {
            if (this.globalCharEmbeddings[char]) {
                for (let i = 0; i < embeddingDim; i++) {
                    vector[i] += this.globalCharEmbeddings[char][i];
                }
            }
        }

        // Усреднение
        //for (let i = 0; i < embeddingDim; i++) {
        //    vector[i] /= normalizedWord.length;
        //}

        // L2 нормализация
        const norm = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
        if (norm > 1e-10) {
            for (let i = 0; i < embeddingDim; i++) {
                vector[i] /= norm;
            }
        }
        //console.log(vector);
        return vector;
    }

    // Добавление слова в категорию
    addWordToCategory() {
        const category = this.categoryInput.value.trim();
        const word = this.wordInput.value.trim();

        if (!category || !word) {
            alert('Пожалуйста, введите категорию и слово');
            return;
        }

        if (!this.categories[category]) {
            this.categories[category] = [];
            this.categoryColors[category] = this.getRandomColor();
        }

        this.categories[category].push(word);
        this.updateCategoriesDisplay();
        this.wordInput.value = '';

        // Если сеть уже инициализирована, нужно обновить архитектуру
        if (this.network) {
            this.initializeNetwork();
        }
    }

    // Обновление отображения категорий
    updateCategoriesDisplay() {
        this.categoriesContainer.innerHTML = '';

        for (const category in this.categories) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-item';
            categoryDiv.innerHTML = `
    < strong > ${category}</strong >: ${this.categories[category]}
<button data-category="${category}">×</button>
`;
            //<strong>${category}</strong>: ${[...this.categories[category]]} слов
            //<strong>${category}</strong>: ${this.categories[category].length}

            this.categoriesContainer.appendChild(categoryDiv);

            // Удаление категории
            categoryDiv.querySelector('button').addEventListener('click', (e) => {
                delete this.categories[category];
                this.updateCategoriesDisplay();
                this.updateVisualization();

                // Переинициализация сети
                if (this.network) {
                    this.initializeNetwork();
                }
            });
        }
    }

    // Обучение сети
    async trainNetwork() {
        if (!this.network) {
            alert('Сначала инициализируйте нейронную сеть');
            return;
        }

        const categories = Object.keys(this.categories);
        if (categories.length < 2) {
            alert('Добавьте как минимум 2 категории для обучения');
            return;
        }

        this.isTraining = true;
        this.trainBtn.disabled = true;
        this.trainingProgress.innerHTML = '<p>Обучение начато...</p>';

        // Подготовка данных для обучения
        const { inputs, targets } = this.prepareTrainingData();
        //console.log(inputs, targets);
        const epochs = parseInt(this.epochsInput.value);

        try {
            const errors = await this.trainNetworkAsync(inputs, targets, epochs);
            this.trainingProgress.innerHTML = `
    < p > Обучение завершено!</p >
        <p>Финальная ошибка: ${errors[errors.length - 1]}</p>
`;
            //console.log(this.network.getWeights()[0]);
        } catch (error) {
            console.log(error);
            this.trainingProgress.innerHTML = `< p > Ошибка при обучении: ${error.message}</p > `;
        } finally {
            this.isTraining = false;
            this.trainBtn.disabled = false;
            this.updateVisualization();
            this.updateVisualizationHeatmap();
        }
    }

    // Асинхронное обучение сети
    trainNetworkAsync(inputs, targets, epochs) {
        return new Promise((resolve) => {
            // Используем requestAnimationFrame для неблокирующего обучения
            const errors = [];
            let epoch = 0;

            const trainStep = async () => {
                if (epoch < epochs) {
                    let totalError = 0;

                    for (let i = 0; i < inputs.length; i++) {
                        const error = await this.network.trainSingle(inputs[i], targets[i]);
                        //const error = this.network.train(inputs, targets);
                        totalError += error;
                    }

                    const avgError = totalError / inputs.length;
                    errors.push(avgError);

                    // Обновление прогресса каждые 10 эпох
                    if (epoch % 10 === 0) {
                        this.updateVisualizationHeatmap();
                        this.trainingProgress.innerHTML = `
    < p > Эпоха ${epoch} /${epochs}</p >
        <p>Текущая ошибка: ${avgError}</p>
`;
                    }

                    epoch++;
                    requestAnimationFrame(trainStep);
                } else {
                    resolve(errors);
                }
            };

            trainStep();
        });
    }




    // Подготовка данных для обучения
    prepareTrainingData() {
        const inputs = [];
        const targets = [];
        const categories = Object.keys(this.categories);

        for (const category of categories) {
            for (const word of this.categories[category]) {
                // Входной вектор
                console.log({ category, word });
                const vector = this.createWordVector(word);
                const input = vector.map(val => [val]); // Преобразуем в матрицу
                inputs.push(input);

                // Целевой вектор (one-hot encoding)
                const target = new Array(categories.length).fill(0);
                const categoryIndex = categories.indexOf(category);
                target[categoryIndex] = 1;
                targets.push(target.map(val => [val])); // Преобразуем в матрицу
            }
        }

        return { inputs, targets };
    }

    // Классификация слов
    //classifyWords() {
    //    if (!this.network || this.isTraining) {
    //        alert('Сначала обучите нейронную сеть');
    //        return;
    //    }

    //    const wordsText = this.newWordsInput.value.trim();
    //    if (!wordsText) {
    //        alert('Пожалуйста, введите слова для классификации');
    //        return;
    //    }

    //    const words = wordsText.split(' ').map(word => word.trim()).filter(word => word);
    //    const categories = Object.keys(this.categories);
    //    let resultsHTML = '<h3>Результаты классификации:</h3><ul>';

    //    words.forEach(word => {
    //        const vector = this.createWordVector(word);
    //        console.log(vector);
    //        console.log(this.isUnitVector(vector));

    //        const unitVector = vector.map(x => x / Math.sqrt(vector.reduce((s, v) => s + v * v, 0)));
    //        console.log(unitVector);
    //        console.log(this.isUnitVector(unitVector));

    //        const input = vector.map(val => [val]);
    //        const output = this.network.predict(input);
    //        console.log(output);

    //        // Находим категорию с максимальной вероятностью
    //        const probabilities = output.flat();
    //        const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    //        const category = categories[maxIndex] || 'Не удалось классифицировать';

    //        // Форматируем вероятности
    //        const probText = probabilities.map((p, i) =>
    //            `${ categories[i] }: ${ (p * 100).toFixed(2) }% `
    //        ).join(', ');

    //        resultsHTML += `< li > <strong>${word}</strong> → ${ category } (${ probText })</li > `;
    //    });

    //    resultsHTML += '</ul>';
    //    this.classificationResults.innerHTML = resultsHTML;

    //    // Обновляем визуализацию с новыми словами
    //    this.updateVisualization(words);
    //}
    async classifyWords() {
        if (!this.network || this.isTraining) {
            alert('Сначала обучите нейронную сеть');
            return;
        }

        const wordsText = this.newWordsInput.value.trim();
        if (!wordsText) {
            alert('Пожалуйста, введите слова для классификации');
            return;
        }

        const words = wordsText.split(' ').map(word => word.trim()).filter(word => word);
        const categories = Object.keys(this.categories);
        let resultsHTML = '<h3>Результаты классификации:</h3><ul>';

        for (const word of words) {
            const vector = this.createWordVector(word);
            const input = vector.map(val => [val]);

            let output;
            if (this.network instanceof NeuralNetwork) {
                // Используем GPU предсказание
                const result = await this.network.gpuForward(input);
                output = result.activations[result.activations.length - 1];
            } else {
                // Используем CPU предсказание
                output = await this.network.predict(input);
            }

            // Находим категорию с максимальной вероятностью
            const probabilities = output.flat();
            const maxIndex = probabilities.indexOf(Math.max(...probabilities));
            const category = categories[maxIndex] || 'Не удалось классифицировать';

            // Форматируем вероятности
            const probText = probabilities.map((p, i) =>
                `${categories[i]}: ${(p * 100).toFixed(2)}% `
            ).join(', ');

            resultsHTML += `< li > <strong>${word}</strong> → ${category} (${probText})</li > `;
        }

        resultsHTML += '</ul>';
        this.classificationResults.innerHTML = resultsHTML;

        // Обновляем визуализацию с новыми словами
        this.updateVisualization(words);
    }

    isUnitVector(vector) {
        // Проверка: массив должен быть непустым и содержать только числа
        if (!Array.isArray(vector) || vector.length === 0) {
            return false;
        }

        const sumOfSquares = vector.reduce((sum, component) => {
            if (typeof component !== 'number' || isNaN(component)) {
                throw new Error('Вектор должен содержать только числа');
            }
            return sum + component * component;
        }, 0);

        const length = Math.sqrt(sumOfSquares);

        // Используем небольшую погрешность для сравнения с плавающей точкой
        const epsilon = 1e-10;
        //return Math.abs(length - 1) < epsilon;
        return length
    }
    updateVisualizationHeatmap() {
        //console.log(this.network.getWeights()[0]);
        for (var i = 0; i < this.network.getWeights().length; i++) {
            this.drawWeightHeatmap(this.network.getWeights()[i], this.heatmaps[i], this.ctxHeatmap[i]);

        }
    }
    weightToColor(weight) {
        //if (weight < 0) {
        //    // От -1 (синий) до 0 (белый)
        //    const t = (weight + 1) / 1; // t ∈ [0, 1]
        //    const r = 255 * (1 - t);    // от 255 до 0
        //    const g = 255 * (1 - t);    // от 255 до 0
        //    const b = 255;              // всегда 255 (синий)
        //    return [r, g, b];
        //} else {
        //    // От 0 (белый) до 1 (красный)
        //    const t = weight / 1;       // t ∈ [0, 1]
        //    const r = 255;              // всегда 255 (красный)
        //    const g = 255 * (1 - t);    // от 255 до 0
        //    const b = 255 * (1 - t);    // от 255 до 0
        //    return [r, g, b];
        //}

        //weightToColor(weight) {
        const intensity = Math.min(1, Math.max(-1, (weight - -1) / (1 - -1)));
        const r = intensity * 255;        // Красный растет с весом
        const g = 0;                      // Зеленый отключен
        const b = (1 - intensity) * 255;  // Синий уменьшается с весом
        return [r, g, b];
        //}
    }
    drawWeightHeatmap(weights, canvas, ctxHeatmap) {
        //const canvas = document.getElementById(canvasId);
        //const ctx = canvas.getContext('2d');
        const height = weights.length;
        const width = weights[0].length;

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = width * 8 + "px";
        canvas.style.height = height * 8 + "px";

        const imageData = ctxHeatmap.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const weight = weights[i][j];
                const [r, g, b] = this.weightToColor(weight);

                const pixelIndex = (i * width + j) * 4;
                data[pixelIndex] = Math.round(r);
                data[pixelIndex + 1] = Math.round(g);
                data[pixelIndex + 2] = Math.round(b);
                data[pixelIndex + 3] = 255;
            }
        }
        ctxHeatmap.putImageData(imageData, 0, 0);
    }


    // Использование:

    // Обновление визуализации
    updateVisualization(newWords = []) {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Получаем данные для визуализации
        const data = this.getVisualizationData();
        //const d2 = {
        //    "0": "x",
        //    "1": "y"
        //};
        //let arr = [1, 2, 3, 4, 6, 7, 8, 9];
        //let bound = arr.length;
        //for (let i = 0; i < bound - 1; i++) {
        //    console.log({
        //        [d2[i & 1]]: arr[i],
        //        [d2[++i & 1]]: arr[++i],
        //    })
        //}


        // Рисуем обучающие слова
        data.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.beginPath();
            //this.ctx.arc(item.x, item.y, 4, 0, Math.PI * 2);
            //this.ctx.arc(1 *380 + 400, 1 *280+300, 4, 0, Math.PI * 2);
            //this.ctx.fill();
            const bound = item.vector.length;

            //for (let i = 0; i < bound - 3; i += 4) {
            //    const x = item.vector[i];
            //    const y = item.vector[++i];
            //    const z = item.vector[++i];
            //    const w = item.vector[++i];
            //    //this.ctx.arc(x * 600 + 400, y * 600 + 300, 5, 0, Math.PI * 2);
            //    //this.ctx.fillRect(x * 600 + 400, y * 600 + 300, z * 100 + w*100, z * 100 + w*100);
            //    //this.ctx.fill();

            //    this.ctx.fillRect(x * 600 + 400, y * 600 + 300, 10, 10);
            //    this.ctx.fill();
            //    this.ctx.fillRect(z * 600 + 400, w * 600 + 300, 10, 10);
            //    this.ctx.fill();
            //}

            for (let i = 0; i < bound; i++) {

                const y = item.vector[i];
                this.ctx.fillRect(i * 10 + 400 - 340, y * 600 + 300, 10, 10);
                this.ctx.fill();

            }
            this.ctx.fillStyle = '#000';


            //this.ctx.font = '12px Arial';
            //this.ctx.fillText(item.word, item.x + 10, item.y + 5);


            let canvas = document.createElement("canvas");
            canvas.style.imageRendering = 'pixelated';
            let ctxHeatmap = canvas.getContext('2d');
            this.heatmap.appendChild(canvas);
            let width = 4;
            let height = 4;

            canvas.width = width;
            canvas.height = height;


            canvas.style.width = width * 40 + "px";
            canvas.style.height = height * 40 + "px";
            const imageData = ctxHeatmap.createImageData(width, height);
            const data = imageData.data;
            for (let i = 0; i < bound; i++) {
                const weight = item.vector;
                //const [r, g, b] = this.weightToColor(weight);
                //console.log(i);
                let pixelIndex = i * 4;
                data[pixelIndex] = weight[pixelIndex] * 255 + (255 / 2);
                data[++pixelIndex] = weight[pixelIndex] * 255 + (255 / 2);
                data[++pixelIndex] = weight[pixelIndex] * 255 + (255 / 2);
                data[++pixelIndex] = weight[pixelIndex] * 255 + (255 / 2);
            }
            ctxHeatmap.putImageData(imageData, 0, 0);

            // Масштабируем средствами canvas если нужно
            //ctxHeatmap.drawImage(ctxHeatmap.canvas, 0, 0, 8, 8, 0, 0, 200, 200);
        });

        // Рисуем новые слова для классификации (если есть)
        if (this.network && newWords.length > 0) {
            newWords.forEach(word => {
                const vector = this.createWordVector(word);
                const input = vector.map(val => [val]);
                const output = this.network.predict(input);

                const categories = Object.keys(this.categories);
                const probabilities = output.flat();
                const maxIndex = probabilities.indexOf(Math.max(...probabilities));
                const category = categories[maxIndex];
                const color = this.categoryColors[category] || '#888';

                // Упрощенная проекция на 2D
                //const x = (vector[0] + vector[1]) * 200 + 400;
                //const x = 0;
                //const y = (vector[2] + vector[3]) * 200 + 300;
                //const y = 0;
                //console.log({ draw: vector, x: x, y: y });


                // Рисуем новый пунктирный круг
                //this.ctx.strokeStyle = color;
                //this.ctx.setLineDash([5, 5]);
                //this.ctx.beginPath();
                //this.ctx.arc(x, y, 12, 0, Math.PI * 2);
                //this.ctx.stroke();
                //this.ctx.setLineDash([]);

                const bound = vector.length;

                for (let i = 0; i < bound - 1; i++) {
                    const x = vector[i];
                    const y = vector[++i];

                    this.ctx.strokeStyle = color;
                    this.ctx.setLineDash([5, 5]);
                    this.ctx.beginPath();
                    this.ctx.arc(x * 600 + 400, y * 600 + 300, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);



                    // Подпись нового слова
                    this.ctx.fillStyle = '#000';
                    this.ctx.font = '14px Arial';
                    this.ctx.fillText(`${word} (${category})`, x + 15, y + 5);
                }




            });
        }

        // Рисуем легенду
        this.drawLegend();
    }

    // Получение данных для визуализации
    getVisualizationData() {
        const data = [];
        const categories = Object.keys(this.categories);

        for (const category of categories) {
            for (const word of this.categories[category]) {
                const vector = this.createWordVector(word);
                // Упрощенная проекция на 2D для визуализации
                const x = (vector[0] + vector[1]) * 200 + 400;
                const y = (vector[2] + vector[3]) * 200 + 300;

                data.push({
                    x, y, vector,
                    color: this.categoryColors[category] || '#888',
                    word: word,
                    category: category
                });
            }
        }

        return data;
    }

    // Рисование легенды категорий
    drawLegend() {
        this.legend.innerHTML = '<h4>Легенда категорий:</h4>';
        const categories = Object.keys(this.categoryColors);

        categories.forEach(category => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'legend-item';
            colorDiv.innerHTML = `
    < span class="color-box" style = "background-color: ${this.categoryColors[category]}" ></span >
        <span>${category}</span>
`;
            this.legend.appendChild(colorDiv);
        });
    }

    // Генерация случайного цвета
    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Инициализация примерами
    async initializeWithExamples() {
        // Добавляем примеры категорий и слов

        //const obj = {
        //    name: items[i].name,
        //    working_hours: items[i].working_hours[0]?.name,
        //    work_schedule_by_days: items[i].work_schedule_by_days[0]?.name,
        //    requirement: items[i].snippet.requirement,
        //    responsibility: items[i].snippet.responsibility,
        //    schedule: items[i].schedule.name,
        //    salary_from: items[i].salary_range?.from || "",
        //    salary_to: items[i].salary_range?.to || items[i].salary_range?.from || "",
        //    frequency: items[i].salary_range?.frequency?.name || "",
        //    currency: items[i].salary_range?.currency || "",
        //    experience: items[i].salary_range?.experience?.name || "",
        //}
        //'Стажёр-разработчик': [
        //    'Образование: Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)',
        //    'Опыт работы: 0–1 год (стажировки, проекты на GitHub, хакатоны)',
        //    "Навыки: Основы Python/JavaScript Работа с Git Базовые знания HTML/CSS Понимание принципов ООП Умение работать в команде",
        //    "Зарплата: 40 000 – 70 000 ₽/мес (Россия, Москва/Санкт-Петербург)",
        //    "График работы: 5/2, 9:00–18:00, гибридный (2–3 дня в офисе)"
        //],
        //"Разработчик": [
        //    'Образование: Бакалавр или магистр в ИТ - сфере',
        //    "Опыт работы: 2–4 года в разработке ПО",
        //    "Навыки: Глубокое знание одного языка(Java, Python, C#) Работа с базами данных(PostgreSQL, MongoDB) REST API, Docker, CI / CD Тестирование(unit / integration) Работа в Agile / Scrum",
        //    "Зарплата: 90 000 – 150 000 ₽/мес",
        //    "График работы: 5 / 2, гибкий график(возможен удалённый формат)",

        //],
        //"Старший разработчик": [
        //    "Образование: Высшее техническое образование (бакалавр/магистр)",
        //    "Опыт работы: 5+ лет, ведущая роль в проектах",
        //    "Навыки: Архитектура систем(микросервисы, event - driven) Оптимизация производительности Наставничество младших разработчиков Работа с облачными платформами(AWS, Azure) Участие в техническом дизайне",
        //    "Зарплата: 160 000 – 280 000 ₽/мес",
        //    "График работы: Гибкий (4–5 дней в неделю), возможен полностью удалённый формат",
        //],
        //"Руководитель группы разработки": [
        //    "Образование: Высшее техническое образование, желательно MBA или дополнительное образование в управлении",
        //    "Опыт работы: 7+ лет в разработке, 2+ года в управлении командой (5–10 человек)",
        //    "Навыки: Управление проектами(Jira, Confluence) Планирование ресурсов и сроков Рекрутинг и оценка персонала Взаимодействие с продуктом и бизнесом Формирование корпоративной культуры",
        //    "Зарплата: 250 000 – 450 000 ₽/мес",
        //    "График работы: 5/2, гибкий, но с обязательными встречами в офисе (1–2 раза в неделю)",
        //],
        //"Технический директор": [
        //    "Образование: Магистр или PhD в области компьютерных наук/инженерии (желательно)",
        //    "Опыт работы: 10+ лет в ИТ, 5+ лет на позиции руководителя технической команды в масштабных компаниях",
        //    "Навыки: Стратегическое планирование ИТ - инфраструктуры Выбор технологических стеков на уровне компании Управление R & D, инновациями Взаимодействие с инвесторами, акционерами Понимание бизнес - моделей и рынка",
        //    "Зарплата: 500 000 – 1 200 000+ ₽/мес (включая бонусы и опционы)",
        //    "График работы: Гибкий, 6 дней в неделю (по необходимости), часто удалённо, но с частыми встречами и поездками",
        //]

        //'exemple': ['exemple', 'exemple', 'exemple', 'exemple', 'exemple'],

        const examples = [
            //{ "Стажёр-разработчик": ["Образование",": Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)"] },
            //{ "Стажёр-разработчик": ["Образование: Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)"] },
            //{ "Стажёр-разработчик": ["Опыт работы: 0–1 год (стажировки, проекты на GitHub, хакатоны)"] },
            //{ "Стажёр-разработчик": ["Навыки: Основы Python/JavaScript Работа с Git Базовые знания HTML/CSS Понимание принципов ООП Умение работать в команде"] },
            //{ "Стажёр-разработчик": ["Зарплата: 40 000 – 70 000 ₽/мес (Россия, Москва/Санкт-Петербург)"] },
            //{ "Стажёр-разработчик": ["График работы: 5/2 9:00–18:00 гибридный (2–3 дня в офисе)"] },
            { "животные": ["собака"] },
            { "растение": ["яблоко"] },


            //{ "Разработчик": ["Образование: Бакалавр", " или магистр в ИТ - сфере"] },
            //{ "Разработчик": ["Образование", ": Бакалавр", " или магистр в ИТ - сфере"] },
            //{ "Разработчик": ["Опыт работы: 2–4 года в разработке ПО"] },
            //{ "Разработчик": ["Навыки: Глубокое знание одного языка(Java, Python, C#) Работа с базами данных(PostgreSQL, MongoDB) REST API, Docker, CI / CD Тестирование(unit / integration) Работа в Agile / Scrum"] },
            //{ "Разработчик": ["Зарплата: 90 000 – 150 000 ₽/мес"] },
            //{ "Разработчик": ["График работы: 5 / 2, гибкий график(возможен удалённый формат)"] },

            //{ "Старший разработчик": ["Образование", ": Высшее техническое образование (бакалавр/магистр)"] },
            //{ "Старший разработчик": ["Опыт работы: 5+ лет, ведущая роль в проектах"] },
            //{ "Старший разработчик": ["Навыки: Архитектура систем(микросервисы, event - driven) Оптимизация производительности Наставничество младших разработчиков Работа с облачными платформами(AWS, Azure) Участие в техническом дизайне"] },
            //{ "Старший разработчик": ["Зарплата: 160 000 – 280 000 ₽/мес"] },
            //{ "Старший разработчик": ["График работы: Гибкий (4–5 дней в неделю), возможен полностью удалённый формат"] },

            //{ "Руководитель группы разработки": ["Образование: Высшее техническое образование, желательно MBA или дополнительное образование в управлении"] },
            //{ "Руководитель группы разработки": ["Образование", " Высшее техническое образование, желательно MBA или дополнительное образование в управлении"] },
            //{ "Руководитель группы разработки": ["Опыт работы: 7+ лет в разработке, 2+ года в управлении командой (5–10 человек)"] },
            //{ "Руководитель группы разработки": ["Навыки: Управление проектами(Jira, Confluence) Планирование ресурсов и сроков Рекрутинг и оценка персонала Взаимодействие с продуктом и бизнесом Формирование корпоративной культуры"] },
            //{ "Руководитель группы разработки": ["Зарплата: 250 000 – 450 000 ₽/мес"] },
            //{ "Руководитель группы разработки": ["График работы: 5/2, гибкий, но с обязательными встречами в офисе (1–2 раза в неделю)"] },

            //{ "Технический директор": ["Образование: Магистр или PhD в области компьютерных наук/инженерии (желательно)"] },
            //{ "Технический директор": ["Образование", ": Магистр или PhD в области компьютерных наук/инженерии (желательно)"] },
            //{ "Технический директор": ["Опыт работы: 10+ лет в ИТ, 5+ лет на позиции руководителя технической команды в масштабных компаниях"] },
            //{ "Технический директор": ["Навыки: Стратегическое планирование ИТ - инфраструктуры Выбор технологических стеков на уровне компании Управление R & D, инновациями Взаимодействие с инвесторами, акционерами Понимание бизнес - моделей и рынка"] },
            //{ "Технический директор": ["Зарплата: 500 000 – 1 200 000+ ₽/мес (включая бонусы и опционы)"] },
            //{ "Технический директор": ["График работы: Гибкий, 6 дней в неделю (по необходимости), часто удалённо, но с частыми встречами и поездками"] },

            //{ "Образование": ["Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)"] },
            //{ "Опыт работы": ["Опыт работы 0–1 год (стажировки, проекты на GitHub, хакатоны)"] },
            //{ "Навыки": ["Навыки Основы Python/JavaScript Работа с Git Базовые знания HTML/CSS Понимание принципов ООП Умение работать в команде"] },
            //{ "Зарплата": ["Зарплата  40 000 – 70 000 ₽/мес (Россия, Москва/Санкт-Петербург)"] },
            //{ "График работы": ["График работы  5/2, 9:00–18:00, гибридный (2–3 дня в офисе)"] },





            //{ "Образование": ["Образование: Бакалавр или магистр в ИТ - сфере"] },
            //{ "Опыт работы": ["Опыт работы: 2–4 года в разработке ПО"] },
            //{ "Навыки": ["Навыки: Глубокое знание одного языка(Java, Python, C#) Работа с базами данных(PostgreSQL, MongoDB) REST API, Docker, CI / CD Тестирование(unit / integration) Работа в Agile / Scrum"] },
            //{ "Зарплата": ["Зарплата: 90 000 – 150 000 ₽/мес"] },
            //{ "График работы": ["График работы: 5 / 2, гибкий график(возможен удалённый формат)"] },



            //{ "Образование": ["Образование  Высшее техническое образование (бакалавр/магистр)"] },
            //{ "Опыт работы": ["Опыт работы: 5+ лет, ведущая роль в проектах"] },
            //{ "Навыки": ["Навыки: Архитектура систем(микросервисы, event - driven) Оптимизация производительности Наставничество младших разработчиков Работа с облачными платформами(AWS, Azure) Участие в техническом дизайне"] },
            //{ "Зарплата": ["Зарплата: 160 000 – 280 000 ₽/мес"] },
            //{ "График работы": ["График работы: Гибкий (4–5 дней в неделю), возможен полностью удалённый формат"] },



            //{ "Образование": ["Образование: Высшее техническое образование, желательно MBA или дополнительное образование в управлении"] },
            //{ "Опыт работы": ["Опыт работы: 7+ лет в разработке, 2+ года в управлении командой (5–10 человек)"] },
            //{ "Навыки": ["Навыки: Управление проектами(Jira, Confluence) Планирование ресурсов и сроков Рекрутинг и оценка персонала Взаимодействие с продуктом и бизнесом Формирование корпоративной культуры"] },
            //{ "Зарплата": ["Зарплата: 250 000 – 450 000 ₽/мес"] },
            //{ "График работы": ["График работы: 5/2, гибкий, но с обязательными встречами в офисе (1–2 раза в неделю)"] },




            //{ "Образование": ["Образование: Магистр или PhD в области компьютерных наук/инженерии (желательно)"] },
            //{ "Опыт работы": ["Опыт работы: 10+ лет в ИТ, 5+ лет на позиции руководителя технической команды в масштабных компаниях"] },
            //{ "Навыки": ["Навыки: Стратегическое планирование ИТ - инфраструктуры Выбор технологических стеков на уровне компании Управление R & D, инновациями Взаимодействие с инвесторами, акционерами Понимание бизнес - моделей и рынка"] },
            //{ "Зарплата": ["Зарплата: 500 000 – 1 200 000+ ₽/мес (включая бонусы и опционы)"] },
            //{ "График работы": ["График работы: Гибкий, 6 дней в неделю (по необходимости), часто удалённо, но с частыми встречами и поездками"] },
        ];
        examples.forEach(row => {
            for (const [category, words] of Object.entries(row)) {
                words.forEach(word => {
                    if (!this.categories[category]) {
                        this.categories[category] = [];
                        this.categoryColors[category] = this.getRandomColor();
                    }
                    this.categories[category].push(word);
                });
                //this.categories[category].push(words);
            }
        })

        this.updateCategoriesDisplay();

        // Инициализируем сеть с примером архитектуры
        this.architectureInput.value = '16, 8';
        this.learningRateInput.value = '0.1';
        this.epochsInput.value = '200';

        this.initializeNetwork();

        //this.dataset.length / 4;
        //for (let i = 0; i < 5; i++) {
        //    const obj = this.dataset[i];
        //    //examples[obj.name] = [obj.working_hours, obj.work_schedule_by_days, obj.requirement, obj.responsibility, obj.schedule, obj.salary_from, obj.salary_to, obj.frequency, obj.currency, obj.experience].join(" ");
        //    examples[obj.name] = [obj.working_hours, obj.work_schedule_by_days, obj.requirement, obj.responsibility, obj.schedule, obj.salary_from, obj.salary_to, obj.frequency, obj.currency, obj.experience];
        //}
        //for (const obj of this.dataset) {
        //    examples[obj.name] = [obj.working_hours, obj.work_schedule_by_days, obj.requirement, obj.responsibility, obj.schedule, obj.salary_from, obj.salary_to, obj.frequency, obj.currency, obj.experience];
        //}
        //.join(" ");
    }

    // Метод для получения текущего состояния
    getState() {
        return {
            network: this.network ? this.network.getState() : null,
            categories: this.categories,
            categoryColors: this.categoryColors,
            trainingData: this.trainingData
        };
    }
    getWord() {
        return {

        }
    }

    // Метод для загрузки состояния
    loadState(state) {
        if (state.network) {
            this.network = new NeuralNetwork(state.network.architecture, state.network.learningRate);
            this.network.loadState(state.network);
        }

        this.categories = state.categories;
        this.categoryColors = state.categoryColors;
        this.trainingData = state.trainingData;

        this.updateCategoriesDisplay();
        this.updateVisualization();
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    window.app = new WordClassificationApp();
    new imegScan();
    // Добавляем обработчики для сохранения/загрузки состояния
    document.getElementById('saveStateBtn').addEventListener('click', () => {
        const state = window.app.getState();
        localStorage.setItem('wordClassificationState', JSON.stringify(state));
        alert('Состояние сохранено!');
        const stateWord = window.app.getWord();
        localStorage.setItem('word', JSON.stringify(stateWord));
        alert('Состояние сохранено!');
    });

    document.getElementById('loadStateBtn').addEventListener('click', () => {
        const savedState = localStorage.getItem('wordClassificationState');
        if (savedState) {
            window.app.loadState(JSON.parse(savedState));
            alert('Состояние загружено!');
        } else {
            alert('Нет сохраненного состояния');
        }
        const savedWord = localStorage.getItem('word');
        if (savedState) {
            window.app.loadState(JSON.parse(savedWord));
            alert('Состояние загружено!');
        } else {
            alert('Нет сохраненного состояния');
        }
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        window.app.updateVisualization();
    });
});

