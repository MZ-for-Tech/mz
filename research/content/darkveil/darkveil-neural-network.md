**DarkVeil: There's a Neural Network Running Behind This Page**

The beautiful shape you’re seeing is **DarkVeil**. A React component created by David Haz, creator and founder of ReactBits. DarkVeil is an animated background component, meant to look organic and fluid. David describes it as “Subtle dark background with a smooth animation and postprocessing” (React Bits, n.d.).

<!-- visual:darkveil -->

Just by looking at it you could make the assumption that this visual is of a quality that could not be done by any amount of CSS or JS tricks. 

You would be right. It is purely math and AI. But how so?

Every pixel on your screen has cartesian coordinates (x,y). These coordinates go into a network of functions, and come out as RGB. Between those two things are eight layers of matrix multiplications and sigmoid activations. At some point of the history of this component, a neural network was trained–or evolved–and its weights extracted and hardcoded directly into the shader. What runs on the GPU is the frozen result of that training: a forward pass, eight layers deep, executing 60 times per second.

But how did we get here? Not by web development.

**Stanley and the biological origin**

Dr. Kenneth O. Stanley, one of the most prominent figures within the domains of evolutionary neural networks and open-ended computational synthesis, argued that in order to advance the computational possibilities of complex systems, there must be "extraordinarily efficient encodings" as seen in humans.

Stanley put it this way:

> “In biology, the genes in DNA represent astronomically complex structures with trillions of interconnecting parts, such as the human brain. Yet DNA does not contain trillions of genes; rather, somehow only 30,000 genes encode the entire human body” (Stanley, 2007).

And so, if 30,000 genes can encode a human brain, what’s the minimum encoding needed to produce a visual pattern?

In 2007, Stanley wrote a paper titled “Compositional pattern producing networks: A novel abstraction of development” trying to understand how DNA produces complex organisms without storing a blueprint (Stanley, 2007).

The paper’s key insight of CPPNs was that instead of having pixels talking to their neighbors — what Stanley called local interactions, and how most generative systems work — every pixel needs to only know one thing about itself.

<!-- paragraph:emphasis --> **“Where am I?”**

Give a point its coordinates, and a well-designed function will tell you its color. No local interactions. No neighborhood rules. No iterative communication across the grid. Just position in, color out. This would allow for the same complexity, for a fraction of the information.

**CPPNs and ANNs**

Are they the same? Frankly, yes and no. ANNs were framed as models of cognition. Of the human brain; CPPNs compose mathematical functions to generate spatial patterns, similar to how DNA works. They apply related machinery to different problems.

At the same time CPPNs and ANNs share the same mathematical skeleton—nodes, weights, matrix multiplications, activation functions, forward passes. If you showed someone the code without context, they would call it a neural network without hesitation. They would be right.

The difference is in what the network is asked to do and what it's given to work with.

<!-- table:ann-cppn-comparison -->
| Dimension | Standard ANN | CPPN |
| --- | --- | --- |
| Input | A dataset of examples: images, text, or numbers. | Coordinates and a function mapping position to output; no example dataset. |
| Learning | Learns from examples by adjusting weights until outputs match expected answers. | Does not learn from example outputs; combines mathematical functions into a pattern generator. |
| Where the information lives | In weights shaped by the relationship between training data and expected outputs. | In the encoded function relating position to output. |
| Result | Recognizes or generates examples based on what it learned. | Produces a pattern from each coordinate. |

**The function behind the shape**

Local interactions are left behind, but the need for something that does the same job isn’t. This is where activation functions come into play. Unlike standard artificial neural networks that typically apply a single activation function, like ReLU or sigmoid, across all nodes, CPPNs combine multiple mathematical functions.

The function DarkVeil mainly used was the sigmoid.

```glsl
vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}
```

The mathematical reason the output looks organic rather than geometric. Sigmoid converts any value into (0,1) — smoothly, continuously, differentiably. Stanley chose it specifically because it produces the smooth gradient transitions that biological patterns exhibit. Every time you see a soft edge in the background, this function is responsible.

<!-- visual:darkveil-activation-comparison -->

The same coordinates, weights, and fixed time across all four panels — only the activation function changes. ReLU kills any negative activation entirely; with weights optimized for sigmoid, most intermediate values go negative and the network collapses to black. Gaussian amplifies mid-range values and suppresses extremes, but without weights tuned for that behavior, the result is unpredictable chaos. Sine oscillates rapidly across the weight range, producing dense high-frequency texture that looks like static noise.

Then we have:

```glsl
vec4 cppn_fn(vec2 coordinate, float in0, float in1, float in2){
```

As the entire neural network declared as a function. It takes a 2D coordinate (a single pixel’s position in space) alongside three floats (the time signals), and outputs a color.

<!-- visual:darkveil-function-signature -->

Everything that follows is the forward pass.

The first thing the network does is construct its inputs.

```glsl
buf[6]=vec4(coordinate.x, coordinate.y, 0.3948333106474662+in0, 0.36+in1);
buf[7]=vec4(0.14+in2, sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y), 0., 0.);
```

`coordinate.x` and `coordinate.y` are the pixel’s position. `in0`, `in1`, and `in2` are the time signals, slowly changing values that will later be responsible for the animation.

Then there is:

```glsl
sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y)
```

which is simply the radial distance from the center.

<!-- visual:darkveil-radial-function -->

This is one of the important ideas Stanley discussed when describing CPPNs. Instead of hard-coding a circle, symmetry, or any specific shape, you give the network a coordinate system in which those relationships can be expressed easily. The network does not need to calculate which pixels are next to each other. It already knows where the current pixel is, and how far it is from the center.

**Inside the forward pass**

Then the actual network begins.

```glsl
buf[0]=mat4(vec4(6.5404263,-3.6126034,...)*buf[6]+mat4(...)*buf[7]+vec4(...);
buf[1]=mat4(vec4(-3.3522482,...)*buf[6]+mat4(...)*buf[7]+vec4(...);
buf[0]=sigmoid(buf[0]);
buf[1]=sigmoid(buf[1]);
```

Which is the first hidden layer.

Those seemingly random numbers inside `mat4(vec4(...))` are the weights. The inputs are multiplied by those weights, a bias is added, and the output is passed through sigmoid.

Matrix multiplication, bias, activation, making it a neural network layer.

Nothing fundamentally different from what you would see inside PyTorch or TensorFlow, except here it is written directly in GLSL so the GPU can execute it for every pixel at the same time.

The same structure repeats again with different weights.

```glsl
buf[6]=sigmoid(buf[6]);
buf[7]=sigmoid(buf[7]);
```

By this point, later layers are no longer working only from the original coordinates. They are combining the outputs of previous layers as well. Each function is operating on the result of functions before it.

This composition is the important part.

A sigmoid by itself does not produce DarkVeil. Neither does radial distance, a sine wave, or a matrix multiplication. The complexity comes from repeatedly composing simple functions until the final relationship between position and color becomes extremely difficult to describe directly.

Eventually, all of those intermediate values are combined into the output layer.

```glsl
buf[0]=mat4(...)*buf[0]+mat4(...)*buf[1]+...+mat4(...)*buf[7]+vec4(...);
buf[0]=sigmoid(buf[0]);
return vec4(buf[0].x, buf[0].y, buf[0].z, 1.);
```

All eight buffers feed into one final transformation. Sigmoid is applied one last time.

Then:

```glsl
buf[0].x, buf[0].y, buf[0].z
```

become red, green, and blue. That is the entire process.

A pixel gives the network its position. The position moves through a series of weighted functions. Three numbers come out. Those three numbers become its color.

Repeat that for every pixel on the screen, and you get the pattern.

**Time Changes Everything**

The original CPPNs were static. Amazing, organic patterns, yet still static. DarkVeil adds another input for a lively visual: **Time**.

The three values from earlier, `in0`, `in1`, and `in2`, come from here:

```glsl
fragColor=cppn_fn(
uv,
0.1*sin(0.3*uTime),
0.1*sin(0.69*uTime),
0.1*sin(0.44*uTime)
);
```

Three sine waves, each at a different frequency. `0.3, 0.69,` and `0.44` respectively.

Because they move at different speeds, they drift relative to one another instead of changing in perfect synchronization. The values entering the network therefore change continuously over time.

The network is still doing the same forward pass, with the only difference is that its inputs are no longer completely fixed.

But DarkVeil also changes time in another place.

Before the coordinates even enter the network, this happens:

```glsl
uv+=uWarp*vec2(
sin(uv.y*6.283+uTime*0.5),
cos(uv.x*6.283+uTime*0.5)
)*0.05;
```

When `uWarp` is nonzero, this changes the coordinate space itself.

Normally a pixel at `(x,y)` enters the network at that same position. When the warp is enabled, sine and cosine slightly shift those coordinates over time. In the essay’s rendered instance, `uWarp` is `0`, so this optional path is off.

Before post-processing, time reaches the network by two paths: it changes the three additional values entering the network, and—when `uWarp` is nonzero—it changes the coordinates being fed into it.

<!-- visual:darkveil-time-diagram -->

The changing inputs keep the pattern moving without requiring pixels to interact with one another. Every pixel is still evaluated independently; the values passed through the function change over time.

This also connects directly back to what Stanley described as composing function types to create new coordinate frames with specific geometric properties, without local interaction between pixels.

In other words, just new coordinate systems being passed into other functions.

**After the network: post-processing**

Finally, after the network has already produced the image, DarkVeil applies its post-processing.

```glsl
col.rgb=hueShiftRGB(col.rgb, uHueShift);
col.rgb*=1.-(scanline_val*scanline_val)*uScan;
col.rgb+=(rand(gl_FragCoord.xy+uTime)-0.5)*uNoise;
```

Hue rotation, scanline darkening, noise grain.

These are normal shader effects. They happen after the CPPN has already decided the underlying structure and color of the pattern.

Which is an important distinction.

<!-- paragraph:thesis --> The network produces the shape. The rest is post-processing.

**A subtle dark background**

David Haz described DarkVeil as a “subtle dark background with smooth animation” (React Bits, n.d.). He’s right for the developer using it, or the user seeing it. But it’s also a trained neural network running a forward pass across every pixel on your screen, sixty times per second, rooted in a 2007 paper about how DNA builds organisms without storing trillions of genes. Both descriptions are true. Both look at the same object from different distances.

**References**

React Bits. (n.d.). *Dark Veil*. [https://reactbits.dev/backgrounds/dark-veil](https://reactbits.dev/backgrounds/dark-veil)

Stanley, K. O. (2007). Compositional pattern producing networks: A novel abstraction of development. *Genetic Programming and Evolvable Machines, 8*(2), 131–162. [https://doi.org/10.1007/s10710-007-9028-8](https://doi.org/10.1007/s10710-007-9028-8)
