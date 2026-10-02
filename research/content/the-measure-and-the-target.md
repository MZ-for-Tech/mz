**The Measure and the Target**

> In 1975, the British economist Charles Goodhart wrote what should be the most important quote in artificial intelligence safety: "Any observed statistical regularity will tend to collapse once pressure is placed upon it for control purposes." (Goodhart, 1975)
>
> Or in the words of anthropologist Marilyn Strathern: “When a measure becomes a target, it ceases to be a good measure.” (Strathern, 1997)

**1. From In-Sample Fit to Held-Out Prediction**

Traditional statisticians almost always rejected the idea of a “one measure fits all”. Take R2 in regression modeling for example. It was introduced because there was a need for a concrete number that’d tell how much of the variance in the target variable was explained by the model.

Then came the realization that it’s easily inflatable, as adding predictors can only maintain or increase in-sample R2, even when those predictors contribute little genuine explanatory value.

<!-- visual:r2-inflation -->

Thus they decided to get the harshest statistical weapon: degrees of freedom. Should one introduce an irrelevant feature, DOF makes unnecessary complexity harder to reward. It became a more conservative measure of fit, but still lacked generalizability outside of the dataset.

AIC, BIC, and cross-validated R2 approached the broader problem from different directions, each attempting to distinguish meaningful model performance from fit that exists only in the data at hand (Akaike, 1974; Schwarz, 1978).

When machine learning came to be, it shifted much of the emphasis from estimating and interpreting relationships toward optimizing out-of-sample predictive performance.

Consider a business trying to understand what drives sales: p-values and confidence intervals help with that inferential question. But if the business wants to know where sales will be by Q4, a predictive model may be more useful. A data scientist asked to model those sales might fit a linear regression model if it’s suitable. If the task is only to predict sales from specific variables, the R2 problem becomes less relevant per se.

They split the data into training and testing and validation. At a small scale, that separation helps protect us from fooling ourselves.

**2. Two Proxy Layers in RLHF**

But what happens when you put this problem onto a large scale? Attention Is All You Need changed the architecture of the field in 2017 (Vaswani et al., 2017), a pivotal year for AI. Google-owned DeepMind and a small, non-profit research laboratory called OpenAI raised the question: How can we communicate goals to an AI system when writing the correct reward function ourselves is difficult? The outcome of that collaboration was a paper titled “Deep Reinforcement Learning from Human Preferences.” It would become a fundamental step toward the technique of “Reinforcement Learning from Human Feedback” (Christiano et al., 2017).

By 2022, ChatGPT had brought large language models to mass audiences, and Goodhart's law became even more critical (OpenAI, 2022).

You create human preference scores because loss doesn't capture usefulness. Then models are optimized against those preference scores.

You create reward models because humans cannot evaluate millions of samples. Then policies discover weaknesses in the reward model (Christiano et al., 2017; Efimov, 2025; Ouyang et al., 2022).

<!-- visual:double-goodhart -->

RLHF is simple in theory, yet it challenges Goodhart’s law not once, but twice. To begin, a dedicated reward model is trained to anticipate what human evaluators favor. Subsequently, the language model is optimized directly against this proxy.

Consequently, one ends up optimizing for a *representation of human preference* rather than genuine user intent (Ouyang et al., 2022). In the gap between the proxy and the underlying objective, reward hacking becomes possible; more subtle distortions, including sycophancy and other evaluator-pleasing behavior, can emerge when they are rewarded more reliably than the thing we actually intended to measure (Gao et al., 2023; Sharma et al., 2024).

At research scale, however, even the benchmark can eventually become a target.

**3. When Benchmarks Become Targets**

You create a held-out test set because training performance is gameable.

But once the same benchmark is reused across papers, architectures, and research decisions for years, researchers begin indirectly optimizing against it too. Eventually the benchmark itself indirectly becomes part of the development process.

In the era of Large Language Models (LLMs), this problem acquired a very unserious name for a serious problem: Benchmaxxing. Whichever benchmark becomes the leading star, it also becomes the target to optimize for—just like R2 before it.

The result could be a model that looks more competent than it actually is. MMLU, HumanEval, GSM8K, SWE-bench, or whatever benchmark happens to dominate the current leaderboard becomes commercially important.

<!-- visual:benchmaxxing -->

Data gets curated around benchmark-like tasks, post-training decisions are informed by leaderboard movement, and eventually the distinction between “we built a better model” and “we built a model better at the tests everyone is watching” becomes increasingly difficult to establish (Akhtar et al., 2026; Chen et al., 2026).

The deeper issue isn't that benchmarks get gamed. It's that once they are, we lose the ability to evaluate the evaluation itself. A student who cheats on an exam still gets a high score. The exam can no longer tell us what it was supposed to.

**4. An Old Problem at a New Scale**

<!-- paragraph:thesis --> And so the problem is less a uniquely machine learning problem than an old problem given a new optimizer: Goodhart’s law applied at computational scale (Manheim & Garrabrant, 2018).

That raises a question: What if many of the problems we now call “AI alignment” are old problems of measurement, incentives, information, and control—only with a far more powerful optimizer on the other side?

**References**

Akaike, H. (1974). [*A new look at the statistical model identification*](https://doi.org/10.1109/TAC.1974.1100705). *IEEE Transactions on Automatic Control, 19*(6), 716–723.

Akhtar, M., Reuel, A., Soni, P., Ahuja, S., Ammanamanchi, P. S., Rawal, R., Zouhar, V., Yadav, S., Whitehouse, C., Ki, D., Mickel, J., Choshen, L., Šuppa, M., Batzner, J., Chim, J., Sania, J., Long, Y., Rahmani, H. A., Knight, C., . . . Solaiman, I. (2026). [*When AI benchmarks plateau: A systematic study of benchmark saturation*](https://doi.org/10.48550/arXiv.2602.16763) [Preprint]. arXiv.

Chen, Y., Zhang, G., & Hardt, M. (2026). [*Leaderboard incentives: Model rankings under strategic post-training*](https://doi.org/10.48550/arXiv.2603.08371) [Preprint]. arXiv.

Christiano, P. F., Leike, J., Brown, T. B., Martic, M., Legg, S., & Amodei, D. (2017). [*Deep reinforcement learning from human preferences*](https://doi.org/10.48550/arXiv.1706.03741) [Preprint]. arXiv.

Efimov, V. (2025, June 21). [*Explained simply: Reinforcement learning from human feedback*](https://towardsdatascience.com/explained-simply-reinforcement-learning-from-human-feedback/). Towards Data Science.

Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling laws for reward model overoptimization](https://proceedings.mlr.press/v202/gao23h.html). In A. Krause, E. Brunskill, K. Cho, B. Engelhardt, S. Sabato, & J. Scarlett (Eds.), *Proceedings of the 40th International Conference on Machine Learning* (Vol. 202, pp. 10835–10866). Proceedings of Machine Learning Research.

Goodhart, C. A. E. (1975). Problems of monetary management: The U.K. experience. In *Papers in monetary economics* (Vol. 1, pp. 1–20). Reserve Bank of Australia.

Manheim, D., & Garrabrant, S. (2018). [*Categorizing variants of Goodhart’s law*](https://doi.org/10.48550/arXiv.1803.04585) [Preprint]. arXiv.

OpenAI. (2022, November 30). [*Introducing ChatGPT*](https://openai.com/index/chatgpt/).

Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C. L., Mishkin, P., Zhang, C., Agarwal, S., Slama, K., Ray, A., Schulman, J., Hilton, J., Kelton, F., Miller, L., Simens, M., Askell, A., Welinder, P., Christiano, P. F., Leike, J., & Lowe, R. (2022). [Training language models to follow instructions with human feedback](https://doi.org/10.52202/068431-2011). *Advances in Neural Information Processing Systems, 35*, 27730–27744.

Schwarz, G. (1978). [Estimating the dimension of a model](https://doi.org/10.1214/aos/1176344136). *The Annals of Statistics, 6*(2), 461–464.

Sharma, M., Tong, M., Korbak, T., Duvenaud, D., Askell, A., Bowman, S. R., Durmus, E., Hatfield-Dodds, Z., Johnston, S. R., Kravec, S. M., Maxwell, T., McCandlish, S., Ndousse, K., Rausch, O., Schiefer, N., Yan, D., Zhang, M., & Perez, E. (2024). [Towards understanding sycophancy in language models](https://proceedings.iclr.cc/paper_files/paper/2024/hash/0105f7972202c1d4fb817da9f21a9663-Abstract-Conference.html). *International Conference on Learning Representations*.

Strathern, M. (1997). ‘Improving ratings’: Audit in the British University system. *European Review, 5*(3), 305–321. [https://doi.org/10.1002/%28SICI%291234-981X%28199707%295:3%3C305::AID-EURO184%3E3.0.CO;2-4](https://doi.org/10.1002/%28SICI%291234-981X%28199707%295:3%3C305::AID-EURO184%3E3.0.CO;2-4)

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [*Attention is all you need*](https://arxiv.org/abs/1706.03762). *Advances in Neural Information Processing Systems, 30*, 5998–6008.
