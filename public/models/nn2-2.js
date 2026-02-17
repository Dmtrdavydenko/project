< !DOCTYPE html >
    <html>
        <head>
            <meta charset="utf-8">
                <title>WebGPU XOR ML</title>
        </head>
        <body>
            <script type="module">

// XOR dataset
                const inputs = new Float32Array([
                0,0,
                0,1,
                1,0,
                1,1
                ]);

                const targets = new Float32Array([
                0,
                1,
                1,
                0
                ]);

                const hiddenSize = 4;
                const inputSize = 2;
                const outputSize = 1;
                const samples = 4;
                const lr = 0.1;

                if (!navigator.gpu) {
                    alert("WebGPU not supported");
                throw "No WebGPU";
}

                const adapter = await navigator.gpu.requestAdapter();
                const device = await adapter.requestDevice();

                function createBuffer(arr, usage) {
  const buffer = device.createBuffer({
                    size: arr.byteLength,
                usage,
                mappedAtCreation: true
  });
                new Float32Array(buffer.getMappedRange()).set(arr);
                buffer.unmap();
                return buffer;
}

                // Random weights
                function randArray(size) {
  const a = new Float32Array(size);
                for (let i=0;i<size;i++) a[i] = (Math.random()-0.5)*2;
                return a;
}

                // Buffers
                const inputBuffer  = createBuffer(inputs, GPUBufferUsage.STORAGE);
                const targetBuffer = createBuffer(targets, GPUBufferUsage.STORAGE);

                const w1Buffer = createBuffer(randArray(inputSize*hiddenSize),
                GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
                const w2Buffer = createBuffer(randArray(hiddenSize*outputSize),
                GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);

                const shader = `

                struct Params {
                    lr: f32,
};

                @group(0) @binding(0) var<storage, read> inputs: array<f32>;
                    @group(0) @binding(1) var<storage, read> targets: array<f32>;
                        @group(0) @binding(2) var<storage, read_write> w1: array<f32>;
                            @group(0) @binding(3) var<storage, read_write> w2: array<f32>;
                                @group(0) @binding(4) var<uniform> params: Params;

fn relu(x: f32) -> f32 {
  return max(x, 0.0);
}

fn drelu(x: f32) -> f32 {
  return select(0.0, 1.0, x > 0.0);
}

fn sigmoid(x: f32) -> f32 {
  return 1.0 / (1.0 + exp(-x));
}

fn dsigmoid(y: f32) -> f32 {
  return y * (1.0 - y);
}

                                    @compute @workgroup_size(4)
                                    fn main(@builtin(global_invocation_id) id: vec3<u32>) {

                                        let i = id.x;
  if (i >= 4u) { return; }

                                        // INPUT
                                        let x0 = inputs[i*2u + 0u];
                                        let x1 = inputs[i*2u + 1u];
                                        let target = targets[i];

                                        // ---- FORWARD ----
                                        var hidden: array<f32,4>;
                                        var hidden_pre: array<f32,4>;

                                        for (var h:u32=0u; h<4u; h++) {
                                            let idx = h*2u;
                                        let z = x0*w1[idx] + x1*w1[idx+1u];
                                        hidden_pre[h] = z;
                                        hidden[h] = relu(z);
  }

                                        var out_pre: f32 = 0.0;
                                        for (var h:u32=0u; h<4u; h++) {
                                            out_pre += hidden[h] * w2[h];
  }

                                        let out = sigmoid(out_pre);

                                        // ---- BACKWARD ----

                                        let loss_grad = 2.0 * (out - target);
                                        let delta_out = loss_grad * dsigmoid(out);

                                        // Update w2
                                        for (var h:u32=0u; h<4u; h++) {
                                            let grad = delta_out * hidden[h];
                                        w2[h] -= params.lr * grad;
  }

                                        // Hidden layer gradient
                                        for (var h:u32=0u; h<4u; h++) {
                                            let dh = delta_out * w2[h];
                                        let dz = dh * drelu(hidden_pre[h]);

                                        let idx = h*2u;

                                        w1[idx]     -= params.lr * dz * x0;
                                        w1[idx +1u] -= params.lr * dz * x1;
  }
}
                                        `;

                                        const module = device.createShaderModule({code: shader});

                                        const paramBuffer = createBuffer(new Float32Array([lr]),
                                        GPUBufferUsage.UNIFORM);

                                        const pipeline = device.createComputePipeline({
                                            layout: "auto",
                                        compute: {
                                            module,
                                            entryPoint: "main"
  }
});

                                        const bindGroup = device.createBindGroup({
                                            layout: pipeline.getBindGroupLayout(0),
                                        entries: [
                                        {binding:0, resource:{buffer:inputBuffer}},
                                        {binding:1, resource:{buffer:targetBuffer}},
                                        {binding:2, resource:{buffer:w1Buffer}},
                                        {binding:3, resource:{buffer:w2Buffer}},
                                        {binding:4, resource:{buffer:paramBuffer}},
                                        ]
});

                                        // TRAIN
                                        for (let epoch=0; epoch<5000; epoch++) {
  const encoder = device.createCommandEncoder();
                                        const pass = encoder.beginComputePass();
                                        pass.setPipeline(pipeline);
                                        pass.setBindGroup(0, bindGroup);
                                        pass.dispatchWorkgroups(4);
                                        pass.end();
                                        device.queue.submit([encoder.finish()]);
}

                                        console.log("Training finished");

                                    </script>
                                </body>
                            </html>
