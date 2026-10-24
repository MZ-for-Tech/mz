

# Abstract

This study examines neural-network compression as a multidimensional model-selection problem, comparing L1 regularization with iterative magnitude pruning, truncated singular value decomposition (SVD), and Gaussian L0-inspired channel gating with tensor surgery. We apply these methods to VGG19 adapted for eight-class BloodMNIST+ classification, evaluating predictive performance, physical model storage, and inference latency. L1 produces 92.84% hard sparsity and 98.29% test macro-F1, while the serialized model remains 532.6 MiB, illustrating ghost sparsity in dense tensors. SVD reduces model-state size from 532.6 MiB to 82.4 MiB and achieves 98.77% test macro-F1. Gaussian L0 with tensor surgery records the lowest inference latency, 96.9 ms per batch (about 58.1% below baseline), with a test macro-F1 of 93.11%. These results show that compression methods target distinct forms of complexity: numerical sparsity, physical storage, and computation. Compression should therefore be assessed jointly across predictive performance, model size, and measured inference efficiency rather than by parameter counts alone.

# Introduction

Overparameterization is a prominent characteristic of many modern neural networks, allowing them to represent a wide range of possible predictive functions. However, the function ultimately learned depends not only on the model’s capacity but also on the training procedure, initialization, and data. Consequently, the raw parameter count alone cannot fully characterize the effective complexity of a fitted model or determine how well it generalizes. This raises an important question: can a trained neural network be represented using fewer parameters while preserving acceptable predictive performance and reducing computational cost?

Learned representations in neural networks are constructed recursively through successive transformations, where each layer receives features produced by the preceding one. Each transformation resembles the systematic-predictor component of a generalized linear model, although hidden layers do not independently specify response distributions. Because these learned representations depend on one another, removing individual coefficients or entire channels may alter subsequent transformations and ultimately affect the model’s predictions. With this recursive structure in mind, we investigate neural-network compression as a statistical model-selection problem, seeking to reduce model complexity while maintaining acceptable predictive performance and considering computational requirements.

To examine this question, we chose an overparameterized model, VGG19, introduced by Karen Simonyan and Andrew Zisserman (Simonyan & Zisserman, 2015). Containing 16 convolutional layers and three fully connected layers, its structure motivated us to implement our methodology. The uneven distribution of parameters between the fully connected and convolutional layers, together with their different computational roles, allows us to investigate compression methods targeting different parts of the network. This motivates different compression strategies. We adapted the pretrained architecture to the eight-class BloodMNIST classification task (Yang et al., 2023).

The different roles of VGG19’s layers motivate our intended use of three methods: L0, L1, and SVD. For the large fully connected layers, we use low-rank approximation with SVD, while L0 targets entire convolutional channels and L1 encourages weight shrinkage, followed by iterative magnitude pruning. These different approaches allow us to investigate different forms of complexity reduction within the same model.

The existing compression literature has established these methods. We compare them to identify complementary approaches worth combining in future research. For instance, our L1 implementation did not produce a hardware improvement, but illustrated a phenomenon we describe as *ghost sparsity*. Altogether, these findings lead us to understand the trade-offs between predictive performance, representation reduction, physical model size, and measured inference efficiency in our particular experimental setting.

This study contributes a comparison of L1, SVD, and L0 on VGG19, examining the complexity each method removes and the predictive performance it preserves, using the same dataset and baseline model as the basis for comparison. We also characterize the ghost sparsity observed in our L1 implementation and present a Pareto analysis of predictive performance, physical model size, and measured inference efficiency.

We should evaluate neural-network compression using multiple criteria for predictive performance and model complexity because different compression methods target different forms of complexity. This motivates our comparison of L1, SVD, and L0 using predictive performance, physical model size, and measured inference efficiency within the same VGG19–BloodMNIST experimental setting.

# Literature Review

When facing the problem of compressing a neural network, we begin with a question: Which weights can we remove without substantially affecting the predictions? We learned from LeCun and colleagues’ *Optimal Brain Damage* (LeCun et al., 1990) that a weight’s numerical magnitude alone does not fully describe its importance or necessity. If we succeed in identifying unnecessary weights, we learn from Han and colleagues’ 2015 work, *Learning Both Weights and Connections for Efficient Neural Networks* (Han et al., 2015), that retraining can help the neural network recover its predictive performance after pruning. However, even after preserving predictive performance, we still need to investigate whether the resulting network achieves smaller storage requirements and improved hardware efficiency.

Replacing dense matrices with low-rank approximations provides another way to investigate redundancy in neural networks. In 2013, Misha Denil and colleagues showed in *Predicting Parameters in Deep Learning* (Denil et al., 2013) that neural-network parameterizations can contain substantial redundancy, and investigated how many parameters could be predicted from smaller learned subsets. In 2014, Emily Denton and colleagues examined, in *Exploiting Linear Structure Within Convolutional Networks for Efficient Evaluation* (Denton et al., 2014), how approximations exploiting linear structure could reduce the computational cost of convolutional networks.

Hao Li and colleagues investigated the removal of complete filters and their associated feature maps in *Pruning Filters for Efficient ConvNets* (Li et al., 2017). Their work highlighted a limitation of unstructured weight pruning: it can introduce irregular sparsity without producing corresponding computational savings on ordinary dense hardware. Removing whole filters, by contrast, allows the network to perform smaller dense computations without depending on specialized sparse convolution libraries. The researchers also evaluated retraining to recover predictive accuracy.

Then we encountered another question: How much will pruning affect the loss? Pavlo Molchanov and colleagues investigated this question in *Pruning Convolutional Neural Networks for Resource Efficient Inference* (Molchanov et al., 2017), using a Taylor expansion to approximate the change in the objective caused by removing a structure. They combined pruning with fine-tuning and investigated pretrained networks adapted to more specialized tasks.

Could the network learn which channels to retain during training instead of relying entirely on a separate pruning rule? This question connects to the differentiable L0 regularization developed by Louizos et al. (2018), who used stochastic gates and a hard-concrete relaxation to allow sparsity decisions to be optimized alongside network parameters. Yamada and colleagues (2020), in their work *Feature Selection using Stochastic Gates* (Yamada et al., 2020), provided further relevant background for Gaussian-based selection mechanisms. However, their work concerned input feature selection rather than channel pruning in VGG19, so the two implementations should not be treated as identical.

In *What is the State of Neural Network Pruning?*, Blalock et al. (2020) investigated the problem of evaluating neural-network compression. Through their comprehensive review of 81 pruning papers and their investigation of pruning techniques under more controlled conditions, they found that the lack of standardized benchmarks, metrics, and experimental practices made comparisons across methods difficult. They introduced ShrinkBench to support more consistent evaluation.

One of the major influences on our choice of L1 was Robert Tibshirani’s 1996 paper, *Regression Shrinkage and Selection via the Lasso* (Tibshirani, 1996). It provides a statistical foundation for encouraging simpler models by penalizing the absolute magnitudes of coefficients. L1 regularization encourages coefficient shrinkage, and in the original Lasso setting, it can also produce exact zeros. However, making a weight smaller does not necessarily mean it is unimportant. We still need to investigate how its removal affects predictive performance.

In our neural-network implementation, we additionally used iterative magnitude pruning to explicitly set selected weights to zero. Yet setting weights to zero does not mean they have been physically removed from dense tensors. This distinction connects the statistical idea behind L1 to the problem of *ghost sparsity* that we observed in our experiment.

Eckart & Young (1936) provide the mathematical foundation for optimal low-rank matrix approximation under the Frobenius norm. But when we apply truncated SVD to a neural network, we must investigate whether the approximated transformations preserve the information needed for prediction.

This is why our experiment evaluates the compressed VGG19 model on BloodMNIST+ rather than relying solely on the matrix approximation error.

The theorem explains why our approximation is mathematically principled. Our classification experiments investigate whether the approximation is useful for the particular task.

# Statistical Foundations

## The Neural Network as a Recursive Statistical Predictor

Facing the classification of eight blood-cell classes in BloodMNIST+, we describe the resulting prediction function as:

$$\hat y=f_{\theta}(x).$$

When recognizing an unfamiliar object, a neural network can learn different characteristics through successive layers. Earlier layers may respond to colors and edges, while later layers combine these representations into textures, shapes, and more complex characteristics of the cell. Each layer transforms the representation learned by the preceding one.

We begin with:

$$h^{(0)}=x.$$

The first learned representation is:

$$h^{(1)}=\sigma(W^{(1)}h^{(0)}+b^{(1)}).$$

The second representation depends on the first:

$$h^{(2)}=\sigma(W^{(2)}h^{(1)}+b^{(2)}).$$

The general expression is:

$${h^{(l)}=\sigma(W^{(l)}h^{(l-1)}+b^{(l)})}.$$

We can illustrate this recursive process through a simplified network: **observed inputs** ($x_1,x_2$, numerical features) → **first learned representation** → **second learned representation** → **final class scores** → **softmax class probabilities**. The equation illustrates a simplified affine transformation; convolutional and pooling operations in VGG19 have their corresponding layer-specific forms.

This dependency helps explain why removing a coefficient or an entire channel can have effects beyond its immediate location. We therefore describe the neural network as a recursive statistical predictor. Its successive transformations resemble the systematic-predictor component of a generalized linear model, although its hidden layers are not independently specified GLMs.

## Empirical Risk and Cross-Entropy

Training minimizes empirical risk over the observed blood-cell images and their labels. In our eight-class BloodMNIST+ classification task, VGG19 produces logits that are converted into estimated class probabilities through softmax. We use categorical cross-entropy, the average negative log-likelihood of the observed labels, to evaluate predictive fit and investigate how compression affects the model’s predictions.

$$\begin{aligned}\hat p_{ik}&=\frac{\exp(a_{ik})}{\sum_{j=1}^{8}\exp(a_{ij})},\\ \mathcal L_{\mathrm{CE}}(\theta)&=-\frac{1}{n}\sum_{i=1}^{n}\log\hat p_{i,y_i}.\end{aligned}$$

Here, $a_{ik}$ is the logit for class $k$ on image $i$, $y_i$ is that image’s observed class, and $n$ is the number of examples used in the loss calculation.

## Regularization and Model Selection

Model selection is more than simply choosing the model with the best predictive fit. It involves balancing predictive performance against model complexity: cross-entropy measures predictive fit, while complexity penalties encourage simpler models. In our study, validation evidence helps us investigate whether the reduction in complexity justifies any associated change in predictive performance. A complexity penalty is explicitly part of regularized training, while methods such as SVD can reduce complexity through rank selection instead. Model selection is the broader process of comparing these alternatives.

A general regularized training objective expresses the predictive-fit and complexity terms together:

$$\mathcal J(\theta)=\mathcal L_{\mathrm{CE}}(\theta)+\lambda\mathcal R(\theta),$$

where $\lambda$ controls the regularization strength. This objective describes penalty-based training; it is not the optimization objective used by every compression branch.

## Second-Order Sensitivity and the Statistical Reasoning Behind Pruning

This leads us to another question: How can we determine which parameters can be removed without substantially affecting the network’s predictions?

We cannot rely entirely on removing weights with the smallest numerical magnitudes, because a small weight can still contribute important information to the prediction. Instead, we should investigate how much the loss function would change if that weight were removed. This corresponds to the statistical idea of sensitivity.

The gradient near a differentiable stationary point satisfies:

$$\nabla\mathcal L(\theta)\approx0.$$

However, a small gradient does not provide enough information about the effect of removing a weight. We need to consider how the loss changes around the current parameters. Using a second-order Taylor approximation near a stationary point:

$${\Delta\mathcal L\approx\frac12\Delta\theta^\top H\Delta\theta}.$$

Here, $H$ is the Hessian matrix, which contains the second derivatives of the loss function, and $\Delta\theta$ represents a change in the network’s parameters. This is a local approximation; if the gradient is not approximately zero, the first-order term also contributes.

Under the diagonal approximation, the estimated increase in loss from deleting a weight is:

$${\Delta\mathcal L_q\approx\frac12H_{qq}w_q^2}.$$

This is the central intuition behind *Optimal Brain Damage* (LeCun, Denker, and Solla, 1990). The estimated importance of a weight depends not only on its magnitude but also on the curvature of the loss function.

However, after removing a weight, other weights may adjust to compensate for its lost contribution. This idea leads to *Optimal Brain Surgeon* (Hassibi & Stork, 1993). Instead of assuming that all remaining weights stay unchanged, OBS accounts for compensating adjustments through the inverse Hessian. Its local saliency expression is:

$${S_q=\frac{w_q^2}{2[H^{-1}]_{qq}}}.$$

Here, $S_q$ does not perform the adjustment itself. It estimates the minimum loss increase after accounting for the best local compensating adjustments under the method’s assumptions. This is important because the Hessian’s off-diagonal entries help represent interactions between parameter changes. Those interactions are related to our intuition about redundant features, although they are not simply a measure of feature correlation.

However, we cannot practically implement full Optimal Brain Surgeon for VGG19 in our experimental setting. VGG19 contains approximately 140 million parameters. A full Hessian with $p$ parameters has dimensions:

$$H\in\mathbb R^{p\times p}.$$

Its number of entries grows as $p^2$. Constructing and inverting the full Hessian would therefore be computationally impractical for this large model.

Our actual compression branches instead use L1 regularization with iterative magnitude pruning, truncated SVD for large fully connected matrices, and Gaussian L0-inspired gating followed by physical channel reconstruction through tensor surgery. These methods pursue the broader objective of reducing model complexity while preserving predictive performance. They are different compression strategies, rather than direct implementations of Optimal Brain Surgeon.

## L1 Sparsity, Gaussian L0-Inspired Gating, and Ghost Sparsity

We have two different approaches to reducing model complexity. The first is L1 regularization, which encourages individual weights to shrink toward zero. In our VGG19 experiment, we followed L1 training with iterative magnitude pruning, explicitly setting selected weights to zero. However, we discovered that even when many weights became zero, they remained stored in their original dense tensors. The model became numerically sparse without necessarily becoming physically smaller or faster. We describe this phenomenon as *ghost sparsity*.

Our second approach, Gaussian L0-inspired gating, addresses a different problem. Instead of encouraging individual coefficients to shrink, it learns selection decisions for entire convolutional channels. After training, we physically remove the selected channels through tensor surgery, reconstructing the network with smaller dense tensors. This allows us to investigate whether structural sparsity can produce actual reductions in model size and inference cost, rather than sparsity in numerical values alone.

The underlying notions of sparsity differ: $\|w\|_1=\sum_j|w_j|$ penalizes absolute weight magnitude, while $\|w\|_0=\sum_j\mathbf 1[w_j\ne0]$ counts nonzero entries. Our Gaussian gates use a differentiable, L0-inspired channel-selection surrogate rather than the exact hard-concrete formulation of Louizos, Welling, and Kingma (2018); the implemented gating rule is described in Methodology.

## Low-Rank Approximation Through SVD

We sought to approximate the original transformations in VGG19’s fully connected layers at a lower rank, so we used truncated SVD to retain the leading singular components. Unlike leaving zero weights inside dense tensors, we replaced the original dense matrices with smaller factors, physically reducing the number of stored parameters. We then evaluated inference latency and predictive performance because low matrix-reconstruction error does not guarantee preserved classification performance or faster execution.

The truncated approximation is written as:

$${W_r=U_r\Sigma_rV_r^\top}.$$

The Eckart–Young result justifies this approximation by minimizing matrix-reconstruction error at a fixed rank under the Frobenius norm, not as a guarantee about task-specific predictions. The input and output dimensions of the layer can remain unchanged even while its internal rank and stored parameter count decrease.

## PCA and Effective Dimensionality in Learned Representations

This motivates us to investigate redundancy in the learned representations of VGG19. To examine how variation is distributed across these representations, we applied Principal Component Analysis (PCA) (Jolliffe, 2002) to selected layer activations, investigating whether a relatively small number of principal components could explain most of the observed variance. By comparing this concentration across layers, we could identify representations that exhibited lower effective dimensionality than their original width suggested.

However, these principal components represent combinations of channel activations rather than individual channels that can be directly removed. Moreover, explaining most of the observed variance does not necessarily mean preserving all the information important for classification. These observations motivated further investigation of structured channel pruning, although the concentration of variance alone does not establish which channels can be safely removed without affecting predictive performance.

For principal-component variances $\lambda_1\ge\cdots\ge\lambda_d$, the explained-variance ratio of the first (r) components is:

$${\operatorname{EVR}(r)=\frac{\sum_{j=1}^{r}\lambda_j}{\sum_{j=1}^{d}\lambda_j}}.$$

In the recorded PCA audit, 59 components explained approximately 95% of the variance of the 512-dimensional spatially averaged activation representation in convolutional Block 5. This does not identify 59 original channels that can be removed. The activation-extraction procedure and sample count are specified in Methodology.

## AIC, BIC, and the Limits of Complexity Proxies

In statistical model selection, we should not rely entirely on goodness of fit, as we also need to consider the complexity required to maintain predictive performance. This motivates the use of information criteria such as the Akaike Information Criterion (AIC) and the Bayesian Information Criterion (BIC), which balance likelihood-based goodness of fit against penalties for model complexity.

From this perspective, we can investigate the trade-off between the original neural network and its reduced versions, considering whether reductions in model complexity justify any associated changes in predictive performance. Both AIC and BIC balance goodness of fit against model complexity. However, while AIC introduces a fixed penalty for each additional parameter, BIC adjusts this penalty according to the logarithm of the sample size.

Their conventional forms are:

$$\begin{aligned}\mathrm{AIC}&=-2\log L(\hat\theta)+2k,\\ \mathrm{BIC}&=-2\log L(\hat\theta)+k\log n.\end{aligned}$$

Here, (L$\hat\theta$) denotes the maximized likelihood in the conventional formulation, $k$ is the fitted-parameter count under its assumptions, and $n$ is sample size (Akaike, 1974; Schwarz, 1978).

Reducing statistical or numerical complexity is not necessarily equivalent to reducing physical model size, improving inference efficiency, or preserving predictive performance. Since our reported AIC- and BIC-style values were calculated using test cross-entropy and parameter-count proxies, we treat them as descriptive fit–complexity comparisons rather than rigorous evidence that one network has superior statistical generalization.

This distinction motivates evaluating predictive performance, physical model size, and inference efficiency separately in the experimental methodology

# Research Methodology

## Experimental Design and Common Baseline

Choosing the VGG19–BloodMNIST+ experimental setting begins with the model itself. We chose VGG19 not only for its overparameterization but also for the uneven distribution of its parameters across convolutional and fully connected layers. For our baseline, we initialized VGG19 with ImageNet-pretrained weights and fine-tuned it on BloodMNIST+ to reduce the burden of learning representations from a relatively small, specialized dataset. The resulting trained model provided a common basis for comparison, reducing differences arising from initialization and initial training when investigating each compression method.

We treated L1 regularization with iterative magnitude pruning (IMP), truncated singular value decomposition (SVD), and Gaussian L0-inspired channel gating with tensor surgery as three separate compression branches. Each branch began from the selected, fine-tuned baseline checkpoint rather than from the output of another compression branch. This allowed us to investigate different aspects of model complexity without presenting their effects as those of one sequential or hybrid compression pipeline.

<!-- visual:vgg19-architecture -->

### Dataset and preprocessing

The second part of our experimental setting is the dataset. We used the 224 × 224 BloodMNIST+ images to match VGG19’s input configuration. The dataset was loaded directly using the MedMNIST `BloodMNIST` interface (Yang et al., 2023) with `size=224` and `as_rgb=True`. Since VGG19 starts with ImageNet-pretrained weights, we normalized the RGB channels using ImageNet means `(0.485, 0.456, 0.406)` and standard deviations `(0.229, 0.224, 0.225)`.

We maintained consistent input dimensions and normalization across the training, validation, and test sets and across the compression branches. Training images additionally received random horizontal and vertical flips and color jitter, with brightness and contrast ranges of 0.2, saturation 0.1, and hue 0.05. Validation and test images received no random augmentation. We used the predefined dataset splits of 11,959 training images, 1,712 validation images, and 3,421 test images, across eight blood-cell classes. The loaders used batches of 64, with training observations shuffled and validation and test observations kept in a fixed order.

<!-- visual:bloodmnist-dataset -->

### Baseline fine-tuning and checkpoint selection

We fine-tuned the VGG19 baseline using stochastic gradient descent (SGD) with momentum 0.9, an initial learning rate of $10^{-3}$, and a stepwise learning-rate schedule that multiplied the rate by 0.1 every seven epochs. We replaced the original final classification layer with an eight-class output and trained using cross-entropy loss. As BloodMNIST+ has unequal frequencies across its eight classes, we used validation macro-F1, which gives equal weight to the F1-score of each class. It was therefore more aligned with our objective of retaining predictive performance across the blood-cell categories.

We trained the baseline for 15 epochs and evaluated validation performance throughout training. Although training loss continued to decrease, the highest eligible validation macro-F1 was recorded at epoch 5, at 98.86%. The checkpoint rule selected improvements in validation macro-F1 subject to a macro ROC-AUC of at least 99%. Selecting that checkpoint established a common baseline according to predictive performance on unseen validation images rather than training loss alone. Subsequent compression branches loaded the same selected baseline model.

## Descriptive PCA Audit of Learned Representations

Before applying compression, we used principal component analysis (PCA) as a descriptive audit of redundancy in the trained baseline’s activation spaces. Forward hooks collected activations from convolutional Blocks 3, 4, and 5 and from the two large fully connected activation layers. For convolutional representations, we averaged each output channel over its spatial dimensions to obtain one value per channel per image. Fully connected activations were collected as feature vectors. We then fitted PCA separately to each activation matrix and recorded the smallest number of principal components explaining at least 95% of the observed variance.

![Figure 3: PCA components explaining 95% of recorded activation variance; values are from the validation-set audit in the original notebook (CELL 3).](/research/vgg19/figures/pca_audit.png)

*Figure 3. PCA components explaining 95% of recorded activation variance; values are from the validation-set audit in the original notebook (CELL 3).*

The extraction code configured a maximum of 3,000 observations but iterated over the validation loader, which contained 1,712 images; the recorded audit therefore used **1,712 validation observations**, not 3,000. The audited dimensions were 256, 512, and 512 for the selected convolutional outputs, and 4,096 for each of the two fully connected activation layers. The corresponding numbers of components explaining 95% of variance were 41, 122, 59, 285, and 137, respectively.

This audit motivated the investigation of redundancy in both the classifier and convolutional base, but it did not identify a removable set of original channels. Principal components are combinations of activation coordinates, and explaining most observed variance is not equivalent to preserving classification performance after channel deletion. We therefore treated PCA as diagnostic motivation rather than as a channel-pruning rule or proof of safe removal.

## L1 Regularization and Iterative Magnitude Pruning

We followed L1 regularization with iterative magnitude pruning, using repeated pruning and masked refinement to give the network a chance to adapt rather than removing all targeted weights in one operation. This iterative approach allowed the surviving weights to adjust between pruning steps. Masked refinement also maintained selected zeros, preventing those connections from becoming active again during subsequent optimization. Finally, we evaluated whether increased sparsity preserved predictive performance, recognizing that numerical sparsity does not automatically produce physical compression.

### Regularization schedule and layer-specific penalties

Our L1 procedure involved two separate stages: choosing a checkpoint from regularization training, then applying three rounds of magnitude pruning and masked refinement. First, we configured a maximum of 30 regularization epochs using SGD with momentum 0.9, an initial learning rate of $5\times10^{-4}$, and cosine warm restarts with a 10-epoch period.

The regularization coefficient followed:

$$\lambda_t=10^{-5}+\frac{t}{30}(3\times10^{-3}-10^{-5}),\qquad t=1,\ldots,30.$$

This means $\lambda$ was configured to increase toward $3\times10^{-3}$. Because the formula starts at $t=1$, the first executed epoch used approximately $1.10\times10^{-4}$ rather than exactly $10^{-5}$. The penalty was not identical across layers: we applied a multiplier of 5 to classifier weights, 0.5 to the first two convolutional layers, and 1 to other eligible weights. Biases were excluded from the L1 penalty. These choices applied different regularization pressures across VGG19, encouraging reductions in the parameter-heavy classifier while treating early convolutional features more conservatively.

### Regularization checkpoint selection

For checkpoint selection, we counted a weight as *soft-sparse* when $|w_j|<10^{-3}$. Among checkpoints, we prioritized greater soft sparsity provided that validation macro-F1 remained within two percentage points of the running peak, macro ROC-AUC remained at least 99%, and minimum per-class F1 remained at least 85%. The configured early-stop rule triggered when validation macro-F1 fell below 88%.

The selected checkpoint was epoch 20, with validation macro-F1 of 98.19% and soft sparsity of approximately 92.5%. Training stopped at epoch 22 when validation macro-F1 fell to 72.23%, below the stopping threshold. We therefore restored epoch 20 before proceeding to magnitude pruning. Although 30 regularization epochs were configured, only 22 were executed.

### Hard pruning and masked refinement

After restoring epoch 20, we applied three pruning-and-refinement cycles:

| **Cycle** | **Hard magnitude threshold** |
|:----------|:-----------------------------|
| 1         | $10^{-3}$                    |
| 2         | $10^{-3}$                    |
| 3         | $1.5\times10^{-3}$           |

Hard magnitude threshold for each pruning cycle.

Each cycle set eligible weights below the applicable magnitude threshold to exactly zero. Refinement used SGD with a learning rate of $10^{-4}$, momentum 0.9, and cosine annealing within each cycle. Gradient masking and repeated zero enforcement prevented pruned weights from becoming active again. During these three cycles, the executable selection rule favored greater hard sparsity. Although validation performance was evaluated, the procedure did not explicitly reapply all the earlier macro-F1, AUC, and per-class guardrails when selecting between cycles. The selected L1 model reached approximately 92.8% hard sparsity; this is numerical sparsity, not a reduction of 92.8% in its saved dense-tensor size.

## Truncated SVD of the Fully Connected Classifier

Targeting VGG19’s large fully connected matrices, we used truncated SVD because FC0 and FC3 contain a substantial proportion of the model’s parameters. By retaining the leading singular components, we replaced the original dense transformations with smaller factors, changing the physical representation of the matrices. We also needed to consider predictive performance when selecting a rank, as it determines how aggressively we compress each transformation. A smaller rank can reduce stored parameters further, but it can also discard more information.

The SVD branch began from the original fine-tuned baseline and applied factorization to FC0 (25,088 inputs to 4,096 outputs) and FC3 (4,096 inputs to 4,096 outputs). Each selected matrix was replaced with two sequential linear transformations of inner dimension $k$, with the original bias retained in the second factor. The rank-selection rule retained the smallest number of singular components satisfying:

$$\frac{\sum_{i=1}^{k}\sigma_i^2}{\sum_{i=1}^{r}\sigma_i^2}\geq\tau,$$

where $\tau$ is the retained squared-singular-value energy threshold.

### Validation-based energy-threshold selection

We evaluated five thresholds on the validation set before fine-tuning:

| **Energy threshold** | **FC0 rank** | **FC3 rank** | **Validation macro-F1** | **Total-parameter reduction** |
|:---------------------|-------------:|-------------:|------------------------:|------------------------------:|
| 0.10                 |           19 |           12 |                  43.70% |                         85.2% |
| **0.20**             |      **44**  |      **31**  |             **95.32%** |                   **84.5%** |
| 0.30                 |           79 |           55 |                  98.46% |                         83.7% |
| 0.40                 |          150 |           92 |                  98.72% |                         82.0% |
| 0.50                 |          309 |          169 |                  98.82% |                         78.2% |

The pre-fine-tuning eligibility thresholds were calculated from an 88% macro-F1 floor minus eight percentage points of slack and a 99% AUC floor minus eight points of slack, giving $F1_{\mathrm{pre}}\geq80\%$ and $AUC_{\mathrm{pre}}\geq91\%$. We selected the eligible candidate with the fewest parameters, using validation macro-F1 as a tie-breaker. Consequently, the 0.10 threshold was rejected because its validation performance was too low, while the 0.20 threshold met the preliminary constraints and produced the smallest parameter count among eligible candidates. The selected ranks were therefore $k_{\mathrm{FC0}}=44$ and $k_{\mathrm{FC3}}=31$. This decision was made before fine-tuning, not retrospectively from test performance. Minimum per-class F1 was recorded in the sweep but was not explicitly used in its preliminary eligibility test.

### Supervised recovery and checkpoint selection

Because SVD optimizes matrix approximation rather than classification loss, we then fine-tuned the factorized network. Trainable parameters included the classifier and the final convolutional layer (`features.34`), allowing the remaining network to adapt to the modified transformations. We used SGD with momentum 0.9, an initial learning rate of $2\times10^{-4}$, cosine annealing, and a maximum of 10 epochs. A fine-tuning checkpoint was eligible when its validation macro-F1 improved upon or matched the running best, macro ROC-AUC was at least 99%, and minimum per-class F1 was at least 85%. The selected checkpoint was epoch 8, with validation macro-F1 of 98.86%.

The energy threshold controls the initial matrix approximation, while subsequent supervised fine-tuning allows the classification model to adapt to that approximation. A 20% retained-energy threshold does not guarantee preservation of classification performance; this is precisely why the validation sweep and recovery training were needed. Finally, we investigated whether the low-rank network preserved predictive performance and whether its smaller parameter representation produced improvements in physical model size and measured inference latency.

## Gaussian L0-Inspired Channel Gating and Tensor Surgery

### Adaptation of stochastic gates for structured channel pruning

We adopted the Gaussian-gating principle from Yamada et al. (2020), who proposed *Feature Selection using Stochastic Gates* (STG), but changed the target of selection. Originally, their method used gates to determine whether an input variable contributed to the predictor. We instead attached gates to the output channels of convolutional layers to investigate whether the pretrained network had learned more internal feature-map channels than were necessary for BloodMNIST classification.

L1 exposed weight-level sparsity without reducing dense tensor dimensions. SVD compressed large fully connected transformations but left much of the convolutional computation unchanged. We therefore directed channel selection toward the convolutional architecture. To learn a structured selection that could later be translated into a physically smaller network, we applied gates across 16 convolutional layers, covering 5,504 output-channel positions. Channel selection alone does not physically remove the associated filters and downstream connections; our subsequent tensor-surgery procedure serves that additional purpose.

### Gaussian gate formulation and sparsity surrogate

Our Gaussian gate was implemented as:

$$z_i=\operatorname{clip}(\mu_i+\sigma\xi_i+0.5,0,1),\qquad \xi_i\sim\mathcal N(0,1),$$

whereas Yamada et al. (2020) used:

$$z_i=\operatorname{clip}(\mu_i+\varepsilon_i,0,1),\qquad \varepsilon_i\sim\mathcal N(0,\sigma^2).$$

In both formulations, Gaussian noise can be represented by a standard-normal sample multiplied by $\sigma$. Our formulation makes this reparameterization explicit, while the additional (+0.5) offset changes the distribution of the pre-clipped gate. We initialized $\mu_i=0.5$ and fixed $\sigma=0.5$. With the added offset, the initial pre-clipped gate has a mean of 1.0, biasing gates toward the open state. This is consistent with our objective of preserving the pretrained representation at initialization rather than immediately removing channels. It ensures that gates are open under the initial deterministic rule, although training-time Gaussian samples can still partly close them.

The implemented Gaussian-CDF regularizer was:

$$\mathcal R_{\mathrm{sparsity}}=\sum_i\Phi\!\left(\frac{\mu_i}{\sigma}\right).$$

Yamada’s expression corresponds to the expected number of positive gates under the original, unshifted sampling rule. We retained this penalty despite adding (+0.5) to the training gate. Consequently, it serves as a differentiable sparsity surrogate rather than the exact expected active-gate count for our shifted distribution. The latter would be:

$$\mathbb E[|z|_0]=\sum_i\Phi\!\left(\frac{\mu_i+0.5}{\sigma}\right).$$

The gate is clipped, so classification gradients pass through its unsaturated region, whereas the separate Gaussian-CDF surrogate provides a differentiable sparsity gradient. After training, we converted the learned gate parameters into deterministic channel-selection decisions using:

$$\hat z_i=\mathbf 1[\mu_i>0].$$

These decisions supplied the retained-channel indices used in tensor surgery. We report the implemented shifted gate and unshifted penalty separately rather than treating them as mathematically identical.

### Adaptive sparsity controller and training schedule

As with delicate brain surgery, we had to be careful when removing entire channels, especially in convolutional networks. We therefore implemented a bounded PID-style adaptive sparsity controller to regulate sparsity pressure while preserving predictive performance. Our training objective was:

$$\mathcal J=\mathcal L_{\mathrm{classification}}+\lambda\mathcal R_{\mathrm{sparsity}}.$$

Rather than holding $\lambda$ constant, we adjusted it according to observed gate sparsity relative to a target of 60%. If we chose a large, fixed regularization strength from the beginning of training, we might force many channels to close rapidly before the remaining network had sufficient opportunity to adapt. This could damage predictive performance. Conversely, a small fixed $\lambda$ might preserve predictive performance but fail to produce meaningful channel sparsity.

We therefore implemented the following feedback rule:

$$\begin{aligned}
\lambda_{t+1} &=
\begin{cases}
\min(1.03\lambda_t,0.002),&e_t>5,\\
\min(1.01\lambda_t,0.002),&0<e_t\leq5,\\
\max(0.70\lambda_t,0.001),&e_t\leq0,
\end{cases}\\[2pt]
e_t &=60-s_t.
\end{aligned}$$

where $s_t$ represents the observed percentage of closed gates. When sparsity was substantially below 60%, the controller increased the penalty more quickly. As sparsity approached the target, the penalty increased more slowly. Once sparsity reached or exceeded 60%, the controller reduced the penalty, allowing less aggressive sparsification.

Although we refer to this procedure as PID-style, the implemented controller follows a bounded multiplicative feedback rule without separate integral or derivative terms, rather than a conventional PID algorithm. We trained the Gaussian-gated network for 40 epochs using Adam and cosine annealing, with a learning rate of $10^{-5}$ for network weights and $2\times10^{-3}$ for gate parameters. We initialized $\lambda$ at $10^{-3}$ and bounded its maximum value at $2\times10^{-3}$. A nominal `end_lambda` value of $1.5\times10^{-3}$ also appears in the configuration, but the executed feedback update does not use it as a linear-ramp endpoint.

### Checkpoint selection and structured reconstruction

Finally, we used validation-based checkpoint selection to identify an eligible candidate rather than relying on the final training epoch alone. The selection rule retained candidates whose validation macro-F1 remained within five percentage points of the running peak, prioritizing greater convolutional weight sparsity among eligible checkpoints. The early-stop macro-F1 floor was disabled. The selected checkpoint was epoch 30, with approximately 69.1% closed gates, 74.5% convolutional weight sparsity, and 92.89% validation macro-F1. The 60% target controlled regularization pressure; it was not a hard requirement that the selected checkpoint finish at precisely 60% sparsity. The controller regulated sparsity pressure during training, whereas checkpoint selection determined which trained candidate to retain according to our validation criteria.

We then physically reconstructed the network using the surviving channels. This required creating smaller dense convolutional tensors, slicing both their surviving output filters and corresponding downstream input-channel dimensions, and adjusting dependent connections rather than simply deleting individual filters. The flattened connection into the first fully connected layer was also reconstructed to retain only the spatial coordinates belonging to surviving final convolutional channels. The remaining classifier transformations were retained. This converted the masked architecture into a physically smaller dense network whose execution could be benchmarked without leaving the removed convolutional channels inside the original tensor dimensions.

<!-- visual:tensor-surgery -->

### Numerical verification of reconstruction

To investigate how the channel-selection procedure affected predictive performance, we compared the original VGG19 with the masked network. To verify whether tensor surgery preserved the behavior of the selected architecture, we compared the masked network with the reconstructed network. Finally, to evaluate the overall trade-off between predictive performance and physical efficiency, we compared the reconstructed network against the original baseline. These comparisons served different purposes rather than simply being an A-versus-B-versus-C ranking.

The reconstruction check applied both models to the same random batch of 16 inputs and computed the maximum absolute difference between their logits:

$$\Delta_{\max}=\max_{i,k}|a^{\mathrm{masked}}_{ik}-a^{\mathrm{reconstructed}}_{ik}|.$$

We recorded $\Delta_{\max}\approx1.91\times10^{-6}$, below the implemented tolerance of $10^{-5}$. This supports numerical agreement of the masked and reconstructed networks on those tested inputs; it does not prove equality for every possible input. If both models lose predictive performance relative to the baseline while agreeing numerically, that loss is more plausibly associated with the preceding gating and channel-selection procedure than with tensor surgery itself.

## Predictive and Physical Evaluation Framework

As we have three experiments, each focusing on a different aspect of model complexity, we need to evaluate them across three dimensions: predictive performance, physical compression, and computational efficiency. For predictive performance, we considered macro-F1, class-level performance, cross-entropy, and other recorded classification metrics. For physical compression, we examined stored model size, retained parameters, and actual structural changes. For computational efficiency, we examined measured inference latency and computational requirements.

In our L1 experiment, zero weights remained inside dense tensors. Therefore, counting nonzero parameters alone would give an incomplete picture of physical compression. With SVD, dimensionality reduction decreased the number of stored parameters, but the convolutional computations remained largely unchanged. Consequently, a smaller model on disk does not necessarily mean an equally large reduction in inference time. With Gaussian L0-inspired pruning, we physically reconstructed the convolutional layers. This allowed us to investigate computational savings, although removing entire channels could also affect the representations needed for classification.

Moreover, macro-F1 alone may be insufficient. Two models can have similar macro-F1 while one performs substantially worse on a particular blood-cell class. This is why class-level analysis matters. We therefore used the same evaluation routine to report top-1 accuracy, macro-F1, one-versus-rest macro ROC-AUC, cross-entropy, Matthews correlation coefficient, Cohen’s kappa, the confusion matrix, and per-class precision, recall, F1, specificity, and ROC-AUC. The minimum per-class F1 was retained as a guardrail or descriptive diagnostic according to the individual branch’s selection rule. Validation observations guided model selection; the test split was used for the recorded comparative evaluations.

For additional descriptive complexity comparisons, the notebook calculated likelihood-related proxies from test cross-entropy and method-specific active-parameter counts:

$$\begin{aligned}\ell_{\mathrm{proxy}}&=-N\bar L,\\\mathrm{AIC}_{\mathrm{proxy}}&=2k-2\ell_{\mathrm{proxy}},\\\mathrm{BIC}_{\mathrm{proxy}}&=k\log N-2\ell_{\mathrm{proxy}}.\end{aligned}$$

where $N=3,421$ and $k$ is the chosen method-specific parameter count. The implementation’s $\bar L$ is an unweighted average of batchwise cross-entropy losses; it is not strictly the exact per-observation mean when batch sizes differ. Moreover, counting nonzero weights or surviving channels is not the same as estimating the effective degrees of freedom of these nonlinear models. We therefore treat the resulting AIC/BIC values and likelihood contrasts as **descriptive complexity proxies**, not classical information-criterion tests or proof that a compressed network is statistically optimal.

## Inference Latency, Model-State Size, and GPU Memory

We measured three different aspects of efficiency: execution time, stored model size, and GPU memory allocation. These measurements should not be treated as interchangeable.

### Latency benchmarking

The recorded inference benchmark used an NVIDIA Tesla T4 GPU (approximately 14.6 GiB of reported memory) and PyTorch 2.10.0+cu128. Test batches contained up to 64 normalized RGB images of shape $3\times224\times224$. Models were placed in evaluation mode, gradient tracking was disabled, and CUDA automatic mixed precision was enabled.

The first ten forward passes were excluded from the reported timing statistics. This helps reduce the influence of initial execution overhead and GPU operating-state changes on the benchmark. GPU operations can execute asynchronously relative to the CPU; without synchronization, a CPU timer may stop before the GPU has completed its computation. We therefore synchronized CUDA immediately before starting the `time.perf_counter()` timer and again after the forward pass, making the recorded interval include completion of the GPU computation. We timed 50 batches and reported their mean and standard deviation in milliseconds per batch:

$$\bar t=\frac1{50}\sum_{i=1}^{50}t_i.$$

The timer measured batch inference **forward-pass latency**, rather than complete image-processing or request-to-response latency. Images were transferred to the device before the timer started; data loading, preprocessing, and host-to-device transfer were excluded. The benchmark reused the test DataLoader when its iterator was exhausted; consequently, the timed batches were not all guaranteed to contain exactly 64 images because the final test batch was smaller.

### Physical model size and memory allocation

To measure stored model size, we used `torch.save(model.state_dict(), path)` to serialize each model’s parameter tensors and persistent buffers into a temporary file. We then calculated:

$$S_{\mathrm{model}}=\frac{\operatorname{file\ size\ in\ bytes}}{1024^2}.$$

The result is measured in MiB, although some recorded output labels use MB. This approach measures serialized dense model-state storage rather than inferring physical size from nonzero parameter counts. The recorded unified comparison gave approximately 532.6 MiB for both the original VGG19 and the L1 model, 82.4 MiB for SVD, 532.6 MiB for the masked Gaussian L0 model, and 134.9 MiB for the reconstructed dense L0 model. These are model-state sizes, not the sizes of complete deployment applications or optimizer-inclusive training checkpoints.

We also measured GPU memory allocation during a forward pass using `torch.cuda.reset_peak_memory_stats(device)` and `torch.cuda.max_memory_allocated(device)`, with evaluation mode, no gradient tracking, and CUDA automatic mixed precision. Peak allocated memory was converted into MiB by dividing bytes by (1024^2). This measurement can include allocations already live when the forward pass begins; it does not necessarily isolate the memory required by the model alone. We also kept any dimension-based FLOP estimates separate from directly measured wall-clock latency.

### Benchmark consistency qualification

We measured inference under comparable hardware and benchmarking conditions so that performance differences were not simply consequences of different measurement procedures. One qualification is necessary: the physically reconstructed Gaussian L0 network was evaluated and timed separately, recording $96.9\pm7.7$ ms per batch. The notebook’s later unified comparison directly remeasured the baseline, L1, SVD, and masked Gaussian L0 models but carried forward the reconstructed network’s earlier size, GPU-memory, and latency figures instead of remeasuring them in that same final pass. We therefore distinguish the recorded speed comparison from a fully repeated, same-session benchmark of every selected model.

## Reproducibility and Interpretation Boundaries

The implementation set a random seed of 42 and used shared dataset preprocessing, validation-based model selection, and a common evaluation interface. Nevertheless, the branches differed in their training schedules and eligibility rules by design: L1 stopped before its configured epoch limit and then underwent masked refinement; SVD used a relatively permissive pre-fine-tuning rank screen followed by stricter checkpoint selection; Gaussian L0 used adaptive sparsity feedback and favored weight sparsity within a validation macro-F1 tolerance. We report the configured settings, executed rules, and selected checkpoints separately rather than treating these procedures as identical.

Our experimental conclusions are limited to the observed BloodMNIST+ splits, the retained checkpoints, and the recorded hardware procedure. PCA variance concentration does not identify safely removable channels, numerical output agreement after tensor surgery does not prove equality on every possible image, and parameter-count reductions do not by themselves imply reduced serialized storage or wall-clock inference time. The three compression branches were evaluated independently, allowing us to compare what each method changed in prediction, storage, and computation without claiming a new combined compression algorithm.

# Results

## Baseline VGG19 Results

When we trained the baseline model to determine its learned weights through optimization, we then assessed it. We found that the best validation macro-F1 was 98.86% at epoch 5, which informed our decision. We then evaluated the checkpoint on previously unused data. A test macro-F1 of 98.57% was achieved by our baseline. We used the held-out test results under comparable evaluation conditions when we compared the baseline against L1, SVD, and Gaussian L0. We used a test set of 3,421 samples, and the macro ROC-AUC was nearly perfect at 99.94%.

![Figure 5: Parameter distribution derived from the original VGG19 classifier and convolution-layer dimensions (notebook CELL 2).](/research/vgg19/figures/baseline_parameters.png)

*Figure 5. Parameter distribution derived from the original VGG19 classifier and convolution-layer dimensions (notebook CELL 2).*

So, these interesting results might not show redundancy, but they encouraged us because the baseline’s predictive performance was great. The PCA audit showed that a relatively small number of principal components captured much of the observed activation variance, which made us investigate what we could achieve from compression, even though we know that variance is not the same as importance or contribution. We wanted to see whether we could maintain most of that performance under a given threshold for each method, with its respective performance assessments described in the Methodology section.

The architecture of the baseline is worth considering, as approximately 85.66% of the 139,603,016 parameters contained in the baseline belong to the fully connected classifier, especially FC0 alone, with 73.61% of the parameters. Therefore, we could identify where substantial parameter reduction might be possible from this uneven distribution.

The baseline’s serialized model-state occupies 532.6 MiB of storage, and the inference latency—under the unified Tesla T4 benchmark—is 231.3 ms per batch, indicating how long its forward execution takes under the measured conditions.

We also need to focus on the convolutional layers. Although they have relatively few parameters compared with the fully connected classifier, these layers repeatedly reuse their weights across spatial positions and can require considerable computation. Setting weights to zero without changing dense tensor dimensions does not necessarily reduce physical storage or improve latency.

An opportunity was presented by this baseline to investigate different forms of compression. These strategies could target reducing physical storage while maintaining acceptable predictive performance, which could be valuable even if the measured computational improvement is limited. So, we are treating compression as a multidimensional problem rather than treating parameter reduction as the only measure of success. In that sense, we evaluated each method in terms of predictive performance, storage reduction, and computational efficiency rather than judging it by parameter count alone.

Across the eight blood-cell classes, the baseline achieved a macro-F1 of 98.57%, with strong aggregate performance, but it did not achieve the same performance across all classes, as platelets achieved the highest F1-score of 100% on the recorded test set, while ImGran had the lowest F1-score at 96.28%.

As described in the Methodology, we used macro-F1 as it gives equal weight to each class’s F1-score, but it cannot show whether one class performs considerably worse than the others or which classes are being confused.

Among the 3,421 test images, 52 were incorrectly classified. Of these errors, 17 neutrophils were classified as ImGran, while nine ImGran images were classified as neutrophils. Together, these 26 errors account for half of all incorrect predictions.

Based on these results, we need to consider both class-level assessments and overall macro-F1 performance, as predictive performance differs across the blood-cell classes.

## L1 Regularization and Iterative Magnitude Pruning Results

Hard sparsity of 92.84% was achieved by the L1 regularization and iterative magnitude pruning experiment we conducted, leaving us with 10 million nonzero parameters out of the original 139.6 million. This was a pivotal reduction, although we retained the original dense tensor dimensions.

![Figure 6: Selected saved L1 regularization epochs showing increasing soft sparsity and later deterioration in validation macro-F1 (notebook CELL 4).](/research/vgg19/figures/l1_progression.png)

*Figure 6. Selected saved L1 regularization epochs showing increasing soft sparsity and later deterioration in validation macro-F1 (notebook CELL 4).*

The reduced model achieved a test macro-F1 of 98.29%, a decrease of approximately 0.28 percentage points relative to the baseline on the recorded test split. That was great, but on paper, the serialized model-state size remained approximately 532.6 MiB, the same as the baseline.

The unified benchmark did not demonstrate an inference speedup. The recorded latency was 238.8 ms/batch for L1 and IMP, compared with 231.3 ms/batch for the baseline.

These dimensional aspects—numerical sparsity, physical storage reduction, and computational efficiency—were worth investigating, as this method demonstrated high success in one aspect but not in the others. The sparsity did not translate into a smaller serialized dense model or improved measured inference speed. This is the distinction we describe as ghost sparsity.

During regularization, soft sparsity increased gradually, reaching 92.5%, with a validation macro-F1 of 98.19% by epoch 20. Two epochs later, the network experienced the trade-off between increasing sparsity and preserving predictive performance: despite an increase in soft sparsity to 94.7%, validation macro-F1 dropped sharply to 72.23%. We retained the selected checkpoint from epoch 20, and three subsequent iterative magnitude-pruning cycles produced 92.84% hard sparsity. Our results suggest that greater sparsity does not necessarily mean a better compressed model. Predictive performance must also be considered.

## Truncated SVD Results

From approximately 139.6 million to 21.6 million parameters, truncated SVD reduced the parameter count by 84.53%, which is not directly comparable to the numerical sparsity achieved by L1. Instead of preserving the original dense tensor dimensions, SVD used smaller low-rank factors to replace the large fully connected weight matrices. To state the ranks, FC0 was factorized using rank 44, and FC3 used rank 31. This reduction in dimensionality resulted in an actual decrease in serialized model-state size, from 532.6 MiB to 82.4 MiB.

![Figure 7: Predictive performance before supervised recovery, at the selected fine-tuned epoch, and on the held-out test set (notebook CELL 5).](/research/vgg19/figures/svd_recovery.png)

*Figure 7. Predictive performance before supervised recovery, at the selected fine-tuned epoch, and on the held-out test set (notebook CELL 5).*

We observed a 0.20-percentage-point improvement in test macro-F1 relative to the baseline, but we cannot conclude that SVD generally improves predictive performance without additional experimental evidence, as the experiment was not repeated.

Targeting only the fully connected classifier successfully reduced the model size, but the convolutional layers, which account for most of the computational work, remained unchanged. In contrast to the 98.69% reduction in estimated fully connected arithmetic, the unified Tesla T4 benchmark recorded a much smaller latency reduction, from 231.3 to 216.6 ms/batch, approximately 6.4%.

These contrasting results motivate our hypothesis that compression is a multidimensional problem, and the remaining aspect to investigate is how Gaussian L0 affects latency. Nevertheless, the much smaller change in inference latency shows that substantially reducing stored model parameters does not necessarily produce proportional computational acceleration. This reinforces our earlier conclusion that compression must be evaluated through several distinct measurements.

The reason behind this reduction is the replacement of the original fully connected matrices with low-rank factors. The approximation of the original weight matrices is based on their singular values, which do not necessarily indicate the importance of the retained directions for classification. With this, the selected factorized model initially achieved 95.32% validation macro-F1.

But when we fine-tuned it, we allowed the reduced classifier and the final convolutional layer to adapt to the classification task. The validation macro-F1 improved to 98.86% at epoch 8, recovering performance without restoring the original large weight matrices.

The low-rank architecture remained smaller by retaining ranks of 44 in FC0 and 31 in FC3, which suggests that it retained enough representational capacity to support strong classification performance after supervised adaptation.

But we cannot conclude that the removed singular directions were irrelevant or that every low-rank approximation would recover similarly.

The final test macro-F1 of 98.77% gives us evidence of how the selected, fine-tuned network performed on the held-out test split.

## Gaussian L0 Channel Gating and Tensor Surgery Results

The channels suppressed by closed gates represented 69.06% of the total gated channels, with convolutional weight sparsity reaching 74.54%. Then, the masked channels were physically removed, improving latency by approximately 58.1% relative to the original baseline, achieving the lowest recorded latency of 96.9 ms/batch, while the actual model-state size decreased to 134.9 MiB.

![Figure 8: Gaussian gate training dynamics reproduced from the original project report, *Applied Statistics in AI* (original report Figure 17, PDF page 49). The report labels the feedback controller PID-style; the executable notebook implements bounded multiplicative feedback.](/research/vgg19/figures/source_l0_training.png)

*Figure 8. Gaussian gate training dynamics reproduced from the original project report, *Applied Statistics in AI* (original report Figure 17, PDF page 49). The report labels the feedback controller PID-style; the executable notebook implements bounded multiplicative feedback.*

Despite the advancements in latency and model size, both masked and reconstructed models achieved 93.11% test macro-F1, approximately 5.46 percentage points below the original baseline. The reconstruction preserved the recorded predictive performance of the selected masked model, while the gating-based compression had already incurred a substantial performance cost.

Different compression methods improve different aspects of model efficiency. Gaussian L0 with tensor surgery produced substantial physical and computational improvements, but its reduction in predictive performance was greater than those observed with L1 and SVD.

During Gaussian gating, we observed that the sparsity of closed channels increased gradually as training progressed. By epoch 30, convolutional weight sparsity reached approximately 74.5%, with a validation macro-F1 of 92.89%. Although we achieved greater sparsity at epoch 40, we retained the checkpoint from epoch 30 based on the validation-selection criteria described in our Methodology.

Looking further into the class-level results, we found that this reduction did not affect all blood-cell classes equally. Basophil F1 decreased from 99.59% to 88.07%, while Platelet F1 decreased only from 100% to 99.25%. We also observed considerable deterioration in ImGran and Lymphocyte performance. Since Gaussian L0 targets convolutional channels, we could consider the possibility that removing some of these channels affected visual information that contributed to distinguishing certain blood-cell classes, such as edges or other learned features. However, we cannot determine which features were lost or what exactly caused these classification errors from the class-level results alone.

These contrasting results show us another aspect of our compression investigation. Although we achieved substantial improvements in inference latency through structural compression, the predictive performance did not remain equally preserved across the different classes. Therefore, we need to consider computational efficiency alongside class-level predictive performance, rather than depending only on the overall macro-F1 when evaluating the Gaussian L0 approach.

## Cross-Method Comparison

| **Model**                  | **Test macro-F1** | **Minimum class F1** | **State size (MiB)** | **Latency (ms/batch)** |
|:---------------------------|------------------:|---------------------:|---------------------:|-----------------------:|
| Baseline VGG19             |            98.57% |               96.28% |                532.6 |                  231.3 |
| L1 + IMP                   |            98.29% |               96.36% |                532.6 |                  238.8 |
| Truncated SVD              |            98.77% |               97.06% |                 82.4 |                  216.6 |
| Gaussian L0, masked        |            93.11% |               88.07% |                532.6 |                  279.1 |
| Gaussian L0, reconstructed |            93.11% |               88.07% |                134.9 |                   96.9 |

In this subsection, we need to determine which dimensions of model complexity each method reduced, what predictive performance it retained, and what trade-offs emerged. We compared the three methods against our original baseline, as the changes are easier to identify and examine this way.

![Figure 9: Per-class test F1 for the baseline, L1 with iterative magnitude pruning, SVD, and masked and reconstructed Gaussian L0 models.](/research/vgg19/figures/source_per_class_f1.png)

*Figure 9. Per-class test F1 for the baseline, L1 with iterative magnitude pruning, SVD, and masked and reconstructed Gaussian L0 models.*

![Figure 10: Held-out macro-F1 from the saved unified evaluation (notebook CELL 7).](/research/vgg19/figures/predictive_comparison.png)

*Figure 10. Held-out macro-F1 from the saved unified evaluation (notebook CELL 7).*

The three methods behaved differently and produced different results, as we observed in the previous sections. We cannot rely on predictive performance alone when evaluating their success. L1 remained close to the baseline, SVD achieved a slight improvement, while Gaussian L0 experienced a more considerable decline. When we investigated the different dimensions of compression, we could see these differences more clearly.

With L1 and iterative magnitude pruning, approximately 92.84% of the parameters were exactly zero. Yet the original dense tensor dimensions remained unchanged, and the serialized model-state size stayed at 532.6 MiB. Therefore, this high numerical sparsity did not represent an equivalent reduction in physically stored parameters. On the other hand, SVD replaced the large fully connected weight matrices with smaller low-rank factors, physically reducing the parameter count by 84.53%. This also reduced the serialized model-state size to 82.4 MiB, the smallest among our evaluated approaches. Gaussian L0 targeted another part of the architecture, suppressing convolutional channels through the selected gates. After tensor surgery, these channels were physically removed, producing smaller convolutional tensors and reducing the model-state size to 134.9 MiB. However, the 74.54% convolutional weight sparsity should not be confused with the reduction in total stored parameters.

Looking at the results together, SVD achieved the highest recorded predictive performance, with a test macro-F1 of 98.77%, slightly above the baseline’s 98.57%, while also achieving the greatest physical storage reduction of approximately 84.5%. Reconstructed Gaussian L0 achieved a smaller storage reduction of approximately 74.7%, but recorded the lowest inference latency among our methods. Through tensor surgery, latency decreased from 231.3 ms/batch for the baseline to 96.9 ms/batch, an observed improvement of approximately 58.1%. Nevertheless, this computational improvement came with a decrease of 5.46 percentage points in test macro-F1 relative to the baseline. L1, in contrast, achieved the greatest numerical sparsity while retaining a test macro-F1 of 98.29%, but neither a smaller serialized dense model nor an inference speedup was observed.

We also need to consider the differences at the class level. The minimum class F1-score was 97.06% for SVD, 96.36% for L1, and only 88.07% for Gaussian L0. Consequently, the deterioration in predictive performance under Gaussian L0 was not limited to the overall macro-F1, as some blood-cell classes experienced substantially greater declines than others.

These contrasting results bring us back to the multidimensional nature of compression that we have been investigating. SVD performed particularly well in reducing physical storage while maintaining strong predictive performance. Gaussian L0 with tensor surgery produced the greatest observed improvement in latency, but with a more substantial reduction in classification performance. Meanwhile, L1 demonstrated that a model could contain a very high proportion of zero-valued parameters while retaining strong predictive performance, without necessarily becoming physically smaller or faster. Therefore, the success of our compression methods cannot be determined from parameter reduction alone, but from the different aspects of model complexity and performance that each method affected.

# Discussion

## Understanding the Different Dimensions of Compression

When we began investigating the compression of VGG19, our question was whether we could reduce the complexity of the network while maintaining its predictive performance on BloodMNIST+. However, our three experiments demonstrated that reducing complexity does not have one meaning, as each method targeted a different part of the network and produced different outcomes.

![Figure 11: Stored state size and recorded forward-pass latency. Reconstructed L0 timing (CELL 6c) was carried forward into the unified CELL 7 comparison; other displayed times are from CELL 7.](/research/vgg19/figures/physical_comparison.png)

*Figure 11. Stored state size and recorded forward-pass latency. Reconstructed L0 timing (CELL 6c) was carried forward into the unified CELL 7 comparison; other displayed times are from CELL 7.*

This distinction became clear when we compared the methods against our baseline. L1 regularization and iterative magnitude pruning demonstrated that a substantial proportion of the network’s weights could be set to zero while retaining strong predictive performance. But the storage and inference latency remained largely unchanged because the original dense tensor dimensions were preserved. On the other hand, SVD reduced the physical dimensions of the fully connected weight representations, while Gaussian L0 with tensor surgery targeted the convolutional channels and reconstructed the network using the surviving channels.

From these contrasting results, we can see that the question is not simply how many parameters we can remove, but what kind of complexity we are reducing and what we gain from that reduction. Our experiments therefore support treating compression as a multidimensional problem, in which numerical sparsity, physical storage, computational efficiency, and predictive performance must be considered together.

## Statistical Redundancy and Predictive Information

Our PCA audit provided an earlier motivation for this investigation. We observed that a relatively small number of principal components captured much of the activation variance in several layers of the baseline. For example, 59 principal components explained approximately 95% of the observed variance in the 512-dimensional spatially averaged representation of convolutional Block 5, while 137 components captured the same proportion in the 4,096-dimensional FC3 representation.

These findings suggested that the learned representations contained concentrated variation, which encouraged us to investigate what different forms of compression could achieve. However, an important distinction emerged from our experiments: the directions accounting for the greatest variance are not necessarily the directions making the greatest contribution to classification.

We can see this relationship when considering L1 and SVD. With L1, we achieved high numerical sparsity while retaining performance close to the baseline. With SVD, we replaced the large fully connected matrices with low-rank factors and observed that the smaller architecture could recover strong predictive performance through fine-tuning. The improvement from 95.32% to 98.86% validation macro-F1 after fine-tuning demonstrated the importance of supervised adaptation following the initial matrix approximation.

Gaussian L0 presented another outcome. Although many convolutional channels were suppressed, the decrease in classification performance was considerably greater. This showed us that removing different kinds of network structure could have different predictive consequences. The PCA audit motivated the investigation of reduced representations, while the compression experiments provided the direct evidence of how well those reduced models performed.

## From Numerical Sparsity to Physical and Computational Efficiency

One of the clearest findings in our experiment was what we described as ghost sparsity. With L1 and iterative magnitude pruning, 92.84% of the parameters became exactly zero, but the serialized model-state size remained approximately 532.6 MiB. We had reduced the number of nonzero coefficients without reducing the physical dimensions of the dense matrices used during inference.

This result connects with the distinction between unstructured and structured pruning discussed in the literature, particularly the work of Li and colleagues (2017). Zero-valued coefficients do not automatically remove the corresponding operations from a dense computational graph. Therefore, a highly sparse model is not necessarily a smaller or faster model under an ordinary dense implementation.

SVD gave us a different outcome. By factorizing the parameter-heavy fully connected layers, we reduced the serialized model-state size to 82.4 MiB while maintaining strong predictive performance. But the observed reduction in latency was much smaller than the parameter reduction. This difference becomes understandable when we consider the architecture of VGG19: although the fully connected classifier contains most of its stored parameters, the convolutional layers account for most of the estimated arithmetic operations.

Our Gaussian L0 experiment investigated this remaining computational burden. The masked model suppressed channels without physically removing their original computations, and its recorded latency was higher than the baseline. After tensor surgery, we reconstructed the network with smaller convolutional tensors, reducing the recorded latency to 96.9 ms/batch. The masked and reconstructed models retained the same test macro-F1 of 93.11%, demonstrating that the physical reconstruction preserved the recorded predictive performance of the selected gated network.

These results establish an important distinction in our work. Numerical sparsity can reduce the number of active coefficients, low-rank factorization can reduce physical parameter storage, and structural channel removal can reduce the operations performed by the reconstructed network. The usefulness of each method therefore depends on the part of the model being targeted and the form of efficiency we want to improve.

## Predictive Performance and Class-Level Trade-offs

The comparison also showed that improvements in physical efficiency can come with different costs to predictive performance. SVD achieved the highest recorded test macro-F1 of 98.77%, together with the smallest serialized model-state size. L1 remained close to the baseline at 98.29%, whereas Gaussian L0 achieved 93.11% after substantial channel suppression.

Looking beyond the aggregate results, we observed that the effects of Gaussian L0 were not distributed equally across the eight blood-cell classes. Basophil F1 decreased from 99.59% to 88.07%, while Platelet F1 remained comparatively strong at 99.25%. We also observed substantial deterioration in ImGran and Lymphocyte performance.

Since Gaussian L0 targets convolutional channels, we considered the possibility that removing selected channels affected learned visual information useful for distinguishing particular blood-cell categories. The class-level results show where performance deteriorated, although identifying the responsible representations would require examining the channels and their contributions more directly.

This finding is important for our evaluation framework. A compressed network may achieve substantial improvements in storage or latency while retaining different levels of predictive performance across the classes. Therefore, the overall macro-F1 cannot be our only predictive consideration. The class-specific results are necessary for understanding the consequences of the compression we applied.

## Our Research Contribution and Experimental Scope

Looking at the three experiments together, our contribution is not the introduction of a new regularization method or a new matrix factorization algorithm. Instead, we investigated how three established compression approaches behave when applied independently to the same VGG19 baseline and BloodMNIST+ classification problem.

We connected the statistical perspective of model complexity with measurements of physical storage and computational efficiency. The L1 experiment characterized ghost sparsity in our dense implementation, SVD demonstrated substantial physical model reduction with strong retained predictive performance, and Gaussian gating followed by tensor surgery demonstrated the computational benefit of reconstructing the convolutional architecture rather than retaining masks alone.

The results also give us a basis for understanding where each approach was most effective. In our recorded experiment, SVD provided the strongest combination of predictive performance and compact serialized storage. Gaussian L0 with tensor surgery achieved the lowest recorded inference latency, while L1 demonstrated substantial numerical sparsity without corresponding physical efficiency gains.

There are some boundaries to these findings that matter for their interpretation. Our comparisons concern the selected checkpoints from the recorded experimental runs, rather than distributions of outcomes across repeated independent training runs. The branches also used different training schedules and selection conditions, as described in Methodology. Therefore, our comparison characterizes the outcomes of these implemented approaches rather than isolating the effect of each algorithm under an identical optimization budget.

For computational efficiency, the reconstructed Gaussian L0 latency was recorded in an earlier benchmark pass and carried into the unified comparison. The resulting latency difference is an observed hardware result, while a fully repeated benchmark would help characterize its stability. Our PCA findings and AIC/BIC-style complexity measurements also serve different purposes: PCA describes the concentration of observed activation variance, while the information-criterion calculations provide descriptive complexity proxies rather than direct measures of physical efficiency.

Within this experimental scope, our findings provide a clear answer to the question we began with. We can substantially reduce different forms of VGG19 complexity, but the outcomes depend on the structure being compressed. Preserving predictive performance, reducing stored model size, and improving inference latency are related objectives, yet our experiments showed that achieving one does not automatically guarantee the others.

# Conclusion and Future Work

When we began investigating the compression of VGG19 for blood-cell image classification on BloodMNIST+, we were interested in whether we could reduce the large number of parameters in the network while maintaining its predictive performance. The baseline contained approximately 139.6 million parameters, and the PCA audit showed that a relatively small number of principal components captured much of the observed activation variance. These findings encouraged us to investigate what we could achieve through compression. But as we moved through our three experiments, another question became important: what exactly are we reducing when we compress a neural network?

We first investigated L1 regularization with iterative magnitude pruning, where we achieved 92.84% hard sparsity while maintaining a test macro-F1 of 98.29%. At first, this was a substantial reduction in the number of nonzero parameters. However, the serialized model-state remained the same size as the baseline. We had made most of the weights zero without physically removing them from the dense network. This was the ghost sparsity we observed in our implementation. With SVD, we investigated a different form of reduction. Instead of leaving zero-valued entries in the original matrices, we replaced the large fully connected weight matrices with smaller low-rank factors. This reduced the model-state size from 532.6 MiB to 82.4 MiB, while the selected model achieved 98.77% test macro-F1. We could therefore achieve substantial physical storage reduction without sacrificing the strong predictive performance observed in our baseline.

But reducing storage was not the end of our investigation. The convolutional layers still accounted for most of the estimated computational work, which brought us to Gaussian L0-inspired channel gating and tensor surgery. This time, we targeted the convolutional architecture itself. By physically removing selected channels rather than merely suppressing them, we achieved the lowest recorded inference latency of 96.9 ms/batch, approximately 58.1% below the baseline measurement. Nevertheless, this improvement came with a greater decline in predictive performance, reaching 93.11% test macro-F1, with some blood-cell classes affected more than others.

So, the three experiments did not give us the same answer, because they were not reducing the same aspect of the network. L1 showed us how many coefficients could become zero while predictive performance remained strong. SVD demonstrated how the parameter-heavy classifier could be physically reduced, and Gaussian L0 with tensor surgery demonstrated how changing the convolutional structure could reduce the computation performed during inference. From these results, we reached the central conclusion of our investigation: compression is a multidimensional problem. The success of a method depends not only on how much of the model we reduce, but also on what part of the architecture we target, how the reduction is implemented, and which aspects of performance we aim to preserve or improve.

## Future Work

There is another question that emerged from these results. If SVD achieved substantial storage reduction by targeting the fully connected classifier, and Gaussian L0 achieved substantial latency reduction by targeting the convolutional layers, what could happen if we investigated both approaches within the same architecture?

This would be a natural continuation of our research. A combined SVD–Gaussian L0 approach could allow us to investigate whether the storage advantages of low-rank factorization and the computational advantages of physical channel removal can be achieved together, while examining how their interaction affects predictive performance. We would also need to investigate the classification behavior of the resulting network across the eight blood-cell classes, particularly those that experienced greater deterioration under structured channel pruning.

We have not implemented this combined approach in our present experiments. However, the contrasting results of the three independent methods give us a foundation for investigating it. We began by asking how much complexity we could remove from VGG19 while maintaining its classification performance. Our experiments have shown that the answer depends on the form of complexity being reduced. The next question is whether we can bring these different reductions together and achieve a better balance between predictive performance, physical storage, and computational efficiency.

# References

Aaronson, S., Lee, L. L., & Li, J. (2026). *Sparsity and out-of-distribution generalization*. <https://arxiv.org/abs/2603.07388>

Acharyya, R., Chattoraj, A., Zhang, B., Das, S., & Štefankovič, D. (2021). *Statistical mechanical analysis of neural network pruning*. University of Rochester.

Akaike, H. (1974). A new look at the statistical model identification. *IEEE Transactions on Automatic Control*, *19*(6), 716–723. <https://doi.org/10.1109/TAC.1974.1100705>

Al Mohamad, M. Y., Bevrani, H., & Haydari, A. A. (2024). *Statistical tuning of artificial neural network*. <https://arxiv.org/abs/2409.16426>

Åström, K. J., & Hägglund, T. (1995). *PID controllers: Theory, design, and tuning* (2nd ed.). Instrument Society of America.

Bai, J., Song, Q., & Cheng, G. (2020). Efficient variational inference for sparse deep learning with theoretical guarantee. *Advances in Neural Information Processing Systems*, *33*, 9974–9985.

Bartlett, P. L., Montanari, A., & Rakhlin, A. (2021). Deep learning: A statistical viewpoint. *Acta Numerica*, *30*, 87–201. <https://doi.org/10.1017/S0962492921000063>

Bellman, R. E. (1957). *Dynamic programming*. Princeton University Press.

Blalock, D., Gonzalez Ortiz, J. J., Frankle, J., & Guttag, J. (2020). What is the state of neural network pruning? *Proceedings of Machine Learning and Systems*, *2*, 129–146. <https://proceedings.mlsys.org/paper_files/paper/2020/hash/6c44dc73014d66ba49b28d483a8f8b0d-Abstract.html>

Breiman, L. (2001). Statistical modeling: The two cultures. *Statistical Science*, *16*(3), 199–231. <https://doi.org/10.1214/ss/1009213726>

Burnham, K. P., & Anderson, D. R. (2002). *Model selection and multimodel inference: A practical information-theoretic approach* (2nd ed.). Springer.

Chatzikonstantinou, C., Papadopoulos, G. T., Dimitropoulos, K., & Daras, P. (2020). Neural network compression using higher-order statistics and auxiliary reconstruction losses. *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops*, 716–717.

Denil, M., Shakibi, B., Dinh, L., Ranzato, M., & Freitas, N. de. (2013). Predicting parameters in deep learning. *Advances in Neural Information Processing Systems 26*. <https://papers.nips.cc/paper/5025-predicting-parameters-in-deep-learning>

Denton, E., Zaremba, W., Bruna, J., LeCun, Y., & Fergus, R. (2014). Exploiting linear structure within convolutional networks for efficient evaluation. *Advances in Neural Information Processing Systems 27*. <https://papers.nips.cc/paper/5544-exploiting-linear-structure-within-convolutional-networks-for-efficient-evaluation>

Eckart, C., & Young, G. (1936). The approximation of one matrix by another of lower rank. *Psychometrika*, *1*(3), 211–218. <https://doi.org/10.1007/BF02288367>

Fawcett, T. (2006). An introduction to ROC analysis. *Pattern Recognition Letters*, *27*(8), 861–874. <https://doi.org/10.1016/j.patrec.2005.10.010>

Francy, S., & Singh, R. (2024). *Edge AI: Evaluation of model compression techniques for convolutional neural networks*. <https://arxiv.org/abs/2409.02134>

Frankle, J., & Carbin, M. (2019). The lottery ticket hypothesis: Finding sparse, trainable neural networks. *International Conference on Learning Representations*. <https://openreview.net/forum?id=rJl-b3RcF7>

Frantar, E., & Alistarh, D. (2022). Optimal brain compression: A framework for accurate post-training quantization and pruning. *Advances in Neural Information Processing Systems*, *35*. <https://proceedings.neurips.cc/paper_files/paper/2022/hash/1caf09c9f4e6b0150b06a07e77f2710c-Abstract-Conference.html>

Geirhos, R., Jacobsen, J.-H., Michaelis, C., Zemel, R., Brendel, W., Bethge, M., & Wichmann, F. A. (2020). Shortcut learning in deep neural networks. *Nature Machine Intelligence*, *2*, 665–673. <https://doi.org/10.1038/s42256-020-00257-z>

Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep learning*. MIT Press. <https://www.deeplearningbook.org/>

Gou, J., Yu, B., Maybank, S. J., & Tao, D. (2021). Knowledge distillation: A survey. *International Journal of Computer Vision*, *129*, 1789–1819. <https://doi.org/10.1007/s11263-021-01453-z>

Guo, C., Pleiss, G., Sun, Y., & Weinberger, K. Q. (2017). On calibration of modern neural networks. *Proceedings of the International Conference on Machine Learning*, 1321–1330. <https://proceedings.mlr.press/v70/guo17a.html>

Han, S., Mao, H., & Dally, W. J. (2016). Deep compression: Compressing deep neural networks with pruning, trained quantization and huffman coding. *International Conference on Learning Representations*. <https://arxiv.org/abs/1510.00149>

Han, S., Pool, J., Tran, J., & Dally, W. J. (2015). Learning both weights and connections for efficient neural networks. *Advances in Neural Information Processing Systems 28*. <https://proceedings.neurips.cc/paper/2015/hash/ae0eb3eed39d2bcef4622b2499a05fe6-Abstract.html>

Hassibi, B., & Stork, D. G. (1993). Second order derivatives for network pruning: Optimal brain surgeon. *Advances in Neural Information Processing Systems 5*. <https://papers.nips.cc/paper_files/paper/1992/hash/303ed4c69846ab36c2904d3ba8573050-Abstract.html>

Hinton, G., Vinyals, O., & Dean, J. (2015). *Distilling the knowledge in a neural network*. <https://arxiv.org/abs/1503.02531>

Howard, A. G., Zhu, M., Chen, B., Kalenichenko, D., Wang, W., Weyand, T., Andreetto, M., & Adam, H. (2017). *MobileNets: Efficient convolutional neural networks for mobile vision applications*. <https://arxiv.org/abs/1704.04861>

Jolliffe, I. T. (2002). *Principal component analysis* (2nd ed.). Springer. <https://doi.org/10.1007/b98835>

Kaplan, J., McCandlish, S., Henighan, T., Brown, T. B., Chess, B., Child, R., Gray, S., Radford, A., Wu, J., & Amodei, D. (2020). *Scaling laws for neural language models*. <https://arxiv.org/abs/2001.08361>

Kelly, C. J., Karthikesalingam, A., Suleyman, M., Corrado, G., & King, D. (2019). Key challenges for delivering clinical impact with artificial intelligence. *BMC Medicine*, *17*, 195. <https://doi.org/10.1186/s12916-019-1426-2>

Kingma, D. P., & Ba, J. (2015). Adam: A method for stochastic optimization. *International Conference on Learning Representations*. <https://arxiv.org/abs/1412.6980>

Kuzmin, A., Nagel, M., Baalen, M. van, Behboodi, A., & Blankevoort, T. (2021). *Pruning vs. Quantization: Which is better?* <https://arxiv.org/abs/2102.04544>

Lang, J., Guo, Z., & Huang, S. (2024). *A comprehensive study on quantization techniques for large language models*. <https://arxiv.org/abs/2308.13137>

Lawson, C. L., Hanson, R. J., Kincaid, D. R., & Krogh, F. T. (1979). Basic linear algebra subprograms for Fortran usage. *ACM Transactions on Mathematical Software*, *5*(3), 308–323. <https://doi.org/10.1145/355841.355847>

LeCun, Y., Denker, J. S., & Solla, S. A. (1990). Optimal brain damage. *Advances in Neural Information Processing Systems 2*, 598–605. <https://proceedings.neurips.cc/paper/1989>

Li, H., Kadav, A., Durdanovic, I., Samet, H., & Graf, H. P. (2017). Pruning filters for efficient ConvNets. *International Conference on Learning Representations*. <https://openreview.net/forum?id=rJqFGTslg>

Liu, D., Zhu, Y., Liu, Z., Liu, Y., Han, C., Tian, J., Li, R., & Yi, W. (2025). A survey of model compression techniques: Past, present, and future. *Frontiers in Robotics and AI*, *12*, 1518965. <https://doi.org/10.3389/frobt.2025.1518965>

Loshchilov, I., & Hutter, F. (2017). SGDR: Stochastic gradient descent with warm restarts. *International Conference on Learning Representations*. <https://arxiv.org/abs/1608.03983>

Louizos, C., Welling, M., & Kingma, D. P. (2018). Learning sparse neural networks through L0 regularization. *International Conference on Learning Representations*. <https://openreview.net/forum?id=H1Y8hhg0b>

Lynch, E. C. (1990). Peripheral blood smear. In H. K. Walker, W. D. Hall, & J. W. Hurst (Eds.), *Clinical methods: The history, physical, and laboratory examinations* (3rd ed.). Butterworths.

Matthews, B. W. (1975). Comparison of the predicted and observed secondary structure of T4 phage lysozyme. *Biochimica Et Biophysica Acta*, *405*(2), 442–451.

Min, J., Song, X., Zheng, S., King, C. B., Deng, X., & Hong, Y. (2024). Applied statistics in the era of artificial intelligence: A review and vision. *Statistics and Its Interface*, *17*, 123–145.

Mirsky, L. (1960). Symmetric gauge functions and unitarily invariant norms. *Quarterly Journal of Mathematics*, *11*(1), 50–59.

Molchanov, P., Tyree, S., Karras, T., Aila, T., & Kautz, J. (2017). Pruning convolutional neural networks for resource efficient inference. *International Conference on Learning Representations*. <https://research.nvidia.com/publication/2017-04_pruning-convolutional-neural-networks-resource-efficient-inference>

Nalisnick, E., Smyth, P., & Tran, D. (2023). A brief tour of deep learning from a statistical perspective. *Annual Review of Statistics and Its Application*, *10*, 219–246.

Nesterov, Y. E. (1983). A method for solving the convex programming problem with convergence rate o(1/k²). *Doklady Akademii Nauk SSSR*, *269*(3), 543–547.

Oliveira, F. D. R., Batista, E. L. O., & Seara, R. (2023). On the compression of neural networks using L0-norm regularization and weight pruning. *Neural Networks*.

Powers, D. M. W. (2011). Evaluation: From precision, recall and f-measure to ROC, informedness, markedness and correlation. *Journal of Machine Learning Technologies*, *2*(1), 37–63.

Rissanen, J. (1978). Modeling by shortest data description. *Automatica*, *14*(5), 465–471. <https://doi.org/10.1016/0005-1098(78)90005-5>

Saha, D., Liu, Z., & Liang, F. (2024). Efficient model compression for bayesian neural networks. *Bayesian Analysis*, *19*, 447–474.

Schwarz, G. (1978). Estimating the dimension of a model. *The Annals of Statistics*, *6*(2), 461–464. <https://doi.org/10.1214/aos/1176344136>

Simonyan, K., & Zisserman, A. (2015). Very deep convolutional networks for large-scale image recognition. *International Conference on Learning Representations*. <https://arxiv.org/abs/1409.1556>

Tan, M., & Le, Q. V. (2019). EfficientNet: Rethinking model scaling for convolutional neural networks. *Proceedings of the International Conference on Machine Learning*, 6105–6114. <https://proceedings.mlr.press/v97/tan19a.html>

Tibshirani, R. (1996). Regression shrinkage and selection via the lasso. *Journal of the Royal Statistical Society: Series B*, *58*(1), 267–288. <https://doi.org/10.1111/j.2517-6161.1996.tb02080.x>

Vapnik, V. N., & Chervonenkis, A. Y. (1971). On the uniform convergence of relative frequencies of events to their probabilities. *Theory of Probability and Its Applications*, *16*(2), 264–280.

Wu, S., Li, G., Chen, F., & Shi, L. (2018). Training and inference with integers in deep neural networks. *International Conference on Learning Representations*. <https://openreview.net/forum?id=HJGXzmspb>

Wu, S., Yang, S., & Kou, S. C. (2025). *Are statistical methods obsolete in the era of deep learning?* <https://arxiv.org/abs/2505.21723>

Xu, S., & Yu, Z. (2025). Neural networks perform sufficient dimension reduction. *Proceedings of the AAAI Conference on Artificial Intelligence*, *39*, 21806–21814.

Yamada, Y., Lindenbaum, O., Negahban, S., & Kluger, Y. (2020). Feature selection using stochastic gates. *Proceedings of Machine Learning Research*, *119*, 10648–10659. <https://proceedings.mlr.press/v119/yamada20a.html>

Yamamoto, K., & Maeno, K. (2018). On the compression of neural networks using L0 norm regularization and weight pruning. *Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing*, 2832–2836.

Yang, J., Shi, R., Wei, D., Liu, Z., Zhao, L., Ke, B., Pfister, H., & Ni, B. (2023). MedMNIST v2: A large-scale lightweight benchmark for 2D and 3D biomedical image classification. *Scientific Data*, *10*, 41. <https://doi.org/10.1038/s41597-022-01721-8>

Zhao, S., Yue, T., & Hu, X. (2020). Distribution-aware adaptive multi-bit quantization. *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 9281–9290.
