@group(0) @binding(0)
var<storage, read> input: array<f32>;
@group(0) @binding(1)
var<storage, read> w1: array<f32>;
@group(0) @binding(2)
var<storage, read> b1: array<f32>;
@group(0) @binding(3)
var<storage, read> w2: array<f32>;
@group(0) @binding(4)
var<storage, read> b2: array<f32>;
@group(0) @binding(5)
var<storage, read_write> hidden: array<f32>;
@group(0) @binding(6)
var<storage, read_write> output: array<f32>;

@group(0) @binding(7)
var<uniform> config: Config;

struct Config {
    inputSize: u32,
    hiddenSize: u32,
    outputSize: u32
}

;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    let inputSize = config.inputSize;
    let hiddenSize = config.hiddenSize;
    let outputSize = config.outputSize;

    // Вычисляем скрытый слой: hidden[i] = gelu( sum(input[j] * w1[i * inputSize + j]) + b1[i] )
    if (idx < hiddenSize) {
        var sum: f32 = 0.0;
        for (var j: u32 = 0; j < inputSize; j = j + 1) {
            sum = sum + input[j] * w1[idx * inputSize + j];
        }
        sum = sum + b1[idx];

        // GELU approximation: x * 0.5 * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
        let x = sum;
        let sqrt2pi = 0.7978845608028654;
        // sqrt(2/pi)
        let tanhInput = sqrt2pi * (x + 0.044715 * x * x * x);
        let gelu = x * 0.5 * (1.0 + tanh(tanhInput));
        hidden[idx] = gelu;
    }

    // Вычисляем выход: output[i] = sum(hidden[j] * w2[i * hiddenSize + j]) + b2[i]
    if (idx < outputSize) {
        var sum: f32 = 0.0;
        for (var j: u32 = 0; j < hiddenSize; j = j + 1) {
            sum = sum + hidden[j] * w2[idx * hiddenSize + j];
        }
        sum = sum + b2[idx];
        output[idx] = sum;
    }
}