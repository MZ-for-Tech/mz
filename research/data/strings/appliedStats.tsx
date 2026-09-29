import { Translations } from '@/research/data/strings/types';
import React, { ReactNode } from 'react';

export const appliedStatsStrings: Translations<Record<string, ReactNode>> = {
    en: {
        intro_p1: (
            <>
                Artificial intelligence has fundamentally transformed modern computing, but this predictive power comes at a severe computational cost. Classical statistical learning theory suggests that highly parameterized models are prone to overfitting. Yet, deep learning often departs from these classical bias-variance expectations through a phenomenon known as <strong>benign overfitting</strong>.
            </>
        ),
        intro_p2: (
            <>
                Architectures such as <strong>VGG19</strong> contain approximately 140 million parameters. When transferred into specialized medical settings—like the <strong>BloodMNIST</strong> hematological imaging task—the model offers immense representational power but creates a massive, statistically unjustifiable parameter-to-task imbalance.
            </>
        ),
        methodology_title: "§1 Research Methodology",
        methodology_margin_title: "BloodMNIST Database",
        methodology_margin_body: "A collection of 17,092 hematological images across 8 classes. The dataset presents a severe morphological challenge due to subtle inter-class variations in leukocyte maturity.",
        methodology_p1: "The objective is to minimize the empirical risk while simultaneously reducing the parameter count $\\mathcal{P}$. This is formulated as a constrained optimization problem:",
        methodology_math: "\\min_{W} \\mathcal{L}(W; \\mathcal{D}) \\quad \\text{s.t.} \\quad \\|W\\|_0 \\leq \\kappa",
        methodology_p2: "where $\\kappa$ is the target parameter budget and $\\mathcal{L}$ is the cross-entropy loss.",
        
        baseline_title: "§2 Baseline Model Analysis",
        baseline_p1: (
            <>
                The uncompressed VGG19 architecture acts as our empirical upper bound. Fine-tuned using SGD, it achieved a top-1 accuracy of <strong>98.48%</strong> with a mean latency of <strong>231.3 ms</strong>.
            </>
        ),
        baseline_margin_title: "Minority Class Protection",
        baseline_margin_body: (
            <>
                The <em>Immature Granulocytes</em> class (the most morphologically ambiguous) was used as the stability anchor, setting the absolute performance floor.
            </>
        ),
        baseline_sub_title: "§ 2.1 Empirical Performance Fidelity",
        baseline_p2: "Our stopping criteria relied on the minimum per-class F1-score to protect minority classes from being \"averaged out\" by high performance on dominant classes.",
        baseline_margin2_title: "Intrinsic Dimensionality",
        baseline_margin2_body: "Learned representations often reside in a lower-dimensional manifold. PCA confirms that >95% of variance in VGG19 is captured by a fraction of the theoretical parameter space.",

        lasso_title: "§3 L1 Lasso Regularization",
        lasso_p1: (
            <>
                The <strong>L1 norm penalty (Lasso)</strong> induces a continuous <em>zero-attraction effect</em> on individual weights. While this statistically simplifies the model, it creates a <strong>Hardware Paradox</strong>.
            </>
        ),
        lasso_math: "w_j^{new} \\leftarrow w_j - \\eta \\nabla \\mathcal{L}_{task,j} - \\eta \\lambda \\text{sign}(w_j)",
        lasso_p2: (
            <>
                To prevent weights from becoming trapped in &quot;nearly-zero&quot; local minima during pruning, we utilized a combination of <strong>Stochastic Gradient Descent with Warm Restarts (SGDR)</strong> for global exploration and the <strong>Adam optimizer</strong> for local convergence. This cyclical approach allowed for a robust discovery of the global error manifold without catastrophic forgetting.
            </>
        ),
        lasso_margin_title: "The SIMD Bottleneck",
        lasso_margin_body: "Modern GPUs use SIMD (Single Instruction, Multiple Data) logic. Unless we physically remove indices, the hardware continues to load and multiply zeros, yielding no real-world speedup.",

        l0_title: "§4 Structured Surgery via L0 Gates",
        l0_p1: (
            <>
                To achieve physical acceleration, we must shift from weight-level sparsity to <strong>channel-level surgery</strong>. We implement a <strong>Gaussian Stochastic Gate</strong>—a differentiable relaxation that samples gate states from a continuous distribution during training.
            </>
        ),
        l0_p2: "To control the pruning rate, we used a PID controller to dynamically modulate the regularization penalty $\\lambda$. This prevented the 'sparsity collapse' often seen in static regularization, successfully stabilizing the network as pressure peaked around epoch 13.",
        l0_margin_title: "The Identity Map",
        l0_margin_body: "By initializing gates at $\\mu=0.5$, we ensure the model is mathematically identical to the baseline at epoch zero, preserving the pre-trained feature hierarchy.",
        l0_sub_title: "§ 4.2 The Latent Hierarchy",
        l0_p3: "Structural analysis reveals a depth-dependent survival gradient across the VGG19 backbone. Visual primitives (edges/colors) showed high survival (75%+), the transition zone saw intermediate survival (~50%) as ImageNet-specific features dropped, and deeper layers exposed massive redundant capacity with low survival (~20%).",
        l0_sub2_title: "§ 4.3 Structured Tensor Surgery",
        l0_sub3_title: "§ 4.4 Inference Throughput Race",

        svd_title: "§5 Low-Rank Factorization (SVD)",
        svd_p1: (
            <>
                The classification head is compressed using <strong>Truncated SVD</strong>, splitting enormous matrices into compressed, sequential multiplications.
            </>
        ),
        svd_math: "W \\approx U_k \\Sigma_k V_k^T",
        svd_sub_title: "§ 5.1 The Diagnostic Fidelity Sweep",
        svd_p2: "Stripping out high-frequency parametric noise through SVD can actually improve classification accuracy by acting as a structural denoiser.",

        synth_title: "§6 Discussion & Unified Synthesis",
        synth_margin_title: "Akaike Criterion (AIC)",
        synth_margin_body: "AIC = $2k - 2\\ln(\\hat{L})$. It penalizes parameter count ($k$) to favor models that achieve high likelihood with minimal complexity.",
        synth_p1: (
            <>
                By applying the <strong>Akaike Information Criterion (AIC)</strong>, we find that our compressed models are not merely smaller—they are statistically superior. The baseline VGG19 (AIC: $2.79 \\times 10^8$) suffers from massive <strong>parametric bloat</strong>, while our SVD variant (AIC: $4.32 \\times 10^7$) and L0 Surgery variant (AIC: $7.11 \\times 10^7$) achieve substantially lower information scores.
            </>
        ),
        synth_sub_title: "§ 6.1 The Pareto Efficiency Frontier",
        synth_p2: (
            <>
                We have mapped a robust <strong>Pareto frontier</strong> governing the trade-off between strict diagnostic fidelity and absolute computational efficiency.
            </>
        ),
        synth_sub2_title: "§ 6.2 Heterogeneous Degradation",
        synth_p3: (
            <>
                The transition from monolithic architectures to compressed variants does not degrade performance uniformly across the classification manifold. Structurally distinct cell types, such as <strong>Platelets</strong> and <strong>Eosinophils</strong>, remain robust under extreme pruning. Conversely, the majority of the diagnostic loss is concentrated in morphologically ambiguous classes like <strong>Basophils</strong> and <strong>Immature Granulocytes</strong>, which require high-dimensional feature detectors in the deepest layers of the network.
            </>
        ),
        synth_sub3_title: "§ 6.3 Unified Error Topology",
        synth_p4: (
            <>
                Comparative analysis of the error manifold across compression techniques. Notice how <strong>SVD</strong> preserves the baseline&apos;s decision boundaries while <strong>L0</strong> introduces selective sensitivity in morphologically similar clusters.
            </>
        ),
        synth_margin2_title: "Orthogonal Compression",
        synth_margin2_body: "Because L0 targets spatial filters and SVD targets linear weights, they operate on different geometric dimensions of the network, allowing for super-linear compounding.",
        synth_sub4_title: "§ 6.4 The Compound Pipeline",
        synth_p5: "The final model architecture utilizes a unified pipeline. Future deployment pipelines can compound these methods to achieve compression ratios inaccessible to any single method."
    },
    ar: {
        intro_p1: "أحدث الذكاء الاصطناعي تحولًا جذريًا في الحوسبة الحديثة، لكن قدرته على التنبؤ تأتي بتكلفة حسابية مرتفعة. وتشير نظرية التعلم الإحصائي الكلاسيكية إلى أن النماذج كثيرة المعاملات معرضة للإفراط في التعلّم. مع ذلك، قد يخرج التعلم العميق عن هذا التوقع عبر ظاهرة تُعرف باسم «الإفراط الحميد في التعلّم».",
        intro_p2: "تضم بنى مثل VGG19 نحو 140 مليون معامل. وعند تكييفها لمهام طبية متخصصة، مثل تصنيف صور خلايا الدم في BloodMNIST، تمنح النموذج قدرة تمثيل كبيرة، لكنها تخلق اختلالًا إحصائيًا بين عدد المعاملات وحجم المهمة.",
        methodology_title: "§1 منهجية البحث",
        methodology_margin_title: "قاعدة بيانات BloodMNIST",
        methodology_margin_body: "تضم المجموعة 17,092 صورة دموية موزعة على 8 فئات. ويصعب التمييز بينها بسبب التقارب الشكلي الدقيق بين مراحل نضج خلايا الدم البيضاء.",
        methodology_p1: "نهدف إلى تقليل المخاطر التجريبية مع خفض عدد المعاملات $\\mathcal{P}$ في الوقت نفسه. ويمكن صياغة ذلك بوصفه مسألة تحسين مقيّدة:",
        methodology_math: "\\min_{W} \\mathcal{L}(W; \\mathcal{D}) \\quad \\text{s.t.} \\quad \\|W\\|_0 \\leq \\kappa",
        methodology_p2: "حيث تمثل $\\kappa$ ميزانية المعاملات المستهدفة، وتمثل $\\mathcal{L}$ دالة خسارة الانتروبيا المتقاطعة.",

        baseline_title: "§2 تحليل النموذج الأساسي",
        baseline_p1: "يمثل نموذج VGG19 غير المضغوط الحد الأعلى التجريبي للمقارنة. وبعد ضبطه باستخدام الانحدار المتدرج العشوائي، حقق دقة أعلى فئة بلغت 98.48٪، ومتوسط زمن استدلال قدره 231.3 مللي ثانية.",
        baseline_margin_title: "حماية الفئات الأقل تمثيلًا",
        baseline_margin_body: "استخدمنا فئة الخلايا المحببة غير الناضجة، وهي الأكثر التباسًا من الناحية الشكلية، مرساةً للاستقرار وحدًا أدنى مطلقًا للأداء.",
        baseline_sub_title: "§ 2.1 الحفاظ على الأداء التجريبي",
        baseline_p2: "اعتمد معيار الإيقاف لدينا على أدنى درجة F1 بين الفئات، لحماية الفئات الأقل تمثيلًا من أن تخفيها النتائج المرتفعة للفئات الشائعة.",
        baseline_margin2_title: "الأبعاد الجوهرية",
        baseline_margin2_body: "غالبًا ما تقع التمثيلات المتعلّمة ضمن فضاء أقل أبعادًا. ويؤكد تحليل المكونات الرئيسية أن جزءًا صغيرًا من فضاء معاملات VGG19 النظري يفسر أكثر من 95٪ من التباين.",

        lasso_title: "§3 تنظيم L1 بطريقة Lasso",
        lasso_p1: "تفرض عقوبة معيار L1 تأثيرًا مستمرًا يجذب الأوزان الفردية نحو الصفر. ويسهم ذلك في تبسيط النموذج إحصائيًا، لكنه يخلق مفارقة عند التنفيذ على العتاد.",
        lasso_math: "w_j^{new} \\leftarrow w_j - \\eta \\nabla \\mathcal{L}_{task,j} - \\eta \\lambda \\text{sign}(w_j)",
        lasso_p2: "لتجنّب احتجاز الأوزان قرب الصفر أثناء التقليم، جمعنا بين الانحدار المتدرج العشوائي مع إعادة التشغيل الدافئة (SGDR) للاستكشاف العام، ومحسّن Adam للتقارب المحلي. وقد ساعد هذا النهج الدوري على استكشاف سطح الخطأ دون نسيان كارثي.",
        lasso_margin_title: "عنق زجاجة SIMD",
        lasso_margin_body: "تعالج وحدات معالجة الرسوميات الحديثة البيانات بمنطق التعليمة الواحدة والبيانات المتعددة (SIMD). وما لم تُحذف الفهارس فعليًا، يواصل العتاد تحميل الأصفار وضربها، فلا يتحقق تسريع فعلي.",

        l0_title: "§4 التقليم البنيوي باستخدام بوابات L0",
        l0_p1: "لتحقيق تسريع فعلي، ننتقل من تناثر الأوزان إلى تقليم القنوات. ونستخدم بوابة غاوسية عشوائية، وهي تقريب قابل للاشتقاق يسحب حالات البوابة من توزيع مستمر أثناء التدريب.",
        l0_p2: "للتحكم في معدل التقليم، استخدمنا متحكم PID لتعديل عقوبة التنظيم $\\lambda$ ديناميكيًا. وقد منع ذلك انهيار التناثر الذي يظهر كثيرًا مع التنظيم الثابت، وساعد على استقرار الشبكة عندما بلغ ضغط التنظيم ذروته قرب الحقبة 13.",
        l0_margin_title: "خريطة الهوية",
        l0_margin_body: "عند تهيئة البوابات بالقيمة $\\mu=0.5$، يكون النموذج مطابقًا رياضيًا للنموذج الأساسي عند الحقبة صفر، مع الحفاظ على التسلسل الهرمي للسمات المدرّبة مسبقًا.",
        l0_sub_title: "§ 4.2 التسلسل الهرمي الكامن",
        l0_p3: "يكشف التحليل البنيوي تدرجًا في بقاء القنوات عبر عمق شبكة VGG19. حافظت السمات البصرية الأولية، مثل الحواف والألوان، على معدلات بقاء مرتفعة تجاوزت 75٪. وسجلت منطقة الانتقال نحو 50٪، بينما أظهرت الطبقات الأعمق سعة زائدة كبيرة ومعدل بقاء يقارب 20٪.",
        l0_sub2_title: "§ 4.3 التقليم البنيوي للموترات",
        l0_sub3_title: "§ 4.4 مقارنة سرعة الاستدلال",

        svd_title: "§5 التحليل منخفض الرتبة باستخدام SVD",
        svd_p1: "ضغطنا رأس التصنيف باستخدام تحليل القيم المفردة المبتور (SVD)، فقسّمنا المصفوفات الكبيرة إلى عمليات ضرب متتابعة أصغر.",
        svd_math: "W \\approx U_k \\Sigma_k V_k^T",
        svd_sub_title: "§ 5.1 قياس الحفاظ على دقة التشخيص",
        svd_p2: "يمكن لإزالة الضوضاء عالية التردد في المعاملات باستخدام SVD أن تحسن دقة التصنيف، إذ يعمل التحليل كمرشح بنيوي للضوضاء.",

        synth_title: "§6 المناقشة والتركيب الموحد",
        synth_margin_title: "معيار أكايكي للمعلومات (AIC)",
        synth_margin_body: "يعرف المعيار بالعلاقة AIC = $2k - 2\\ln(\\hat{L})$. وهو يعاقب زيادة عدد المعاملات ($k$)، ويفضّل النماذج ذات الاحتمالية المرتفعة والتعقيد الأقل.",
        synth_p1: "بالتطبيق وفق معيار أكايكي للمعلومات، وجدنا أن النماذج المضغوطة ليست أصغر فحسب، بل حققت درجات معلومات أفضل. سجل نموذج VGG19 الأساسي 2.79 × 10⁸، مقابل 4.32 × 10⁷ لنسخة SVD و7.11 × 10⁷ لنسخة تقليم L0.",
        synth_sub_title: "§ 6.1 جبهة كفاءة باريتو",
        synth_p2: "حددنا جبهة باريتو متينة تحكم المفاضلة بين الحفاظ الصارم على دقة التشخيص ورفع الكفاءة الحسابية.",
        synth_sub2_title: "§ 6.2 تفاوت تدهور الأداء",
        synth_p3: "لا يؤدي الانتقال من البنى الضخمة إلى النماذج المضغوطة إلى تدهور موحد للأداء. فقد ظلت فئات مميزة شكليًا، مثل الصفائح الدموية والخلايا الحمضية، متينة حتى مع التقليم الشديد. في المقابل، تركز معظم الخسارة التشخيصية في الفئات المتشابهة شكليًا، مثل الخلايا القاعدية والخلايا المحببة غير الناضجة، التي تحتاج إلى كواشف سمات عالية الأبعاد في الطبقات العميقة.",
        synth_sub3_title: "§ 6.3 البنية الموحدة للأخطاء",
        synth_p4: "تقارن هذه النتائج سطح الخطأ بين تقنيات الضغط. يحافظ SVD على حدود القرار في النموذج الأساسي، بينما تضيف بوابات L0 حساسية انتقائية داخل المجموعات المتقاربة شكليًا.",
        synth_margin2_title: "ضغط متعامد",
        synth_margin2_body: "يستهدف L0 المرشحات المكانية، بينما يستهدف SVD الأوزان الخطية. لذلك يعمل الأسلوبان على أبعاد هندسية مختلفة من الشبكة، ويمكن أن يؤدي جمعهما إلى أثر تراكمي يتجاوز أثر كل منهما منفردًا.",
        synth_sub4_title: "§ 6.4 مسار الضغط المركب",
        synth_p5: "تستخدم البنية النهائية للنموذج مسارًا موحدًا. ويمكن لخطوط النشر المستقبلية أن تجمع هذه الأساليب لتحقيق نسب ضغط يصعب بلوغها بأي طريقة منفردة."
    }
};

export type AppliedStatsStringKey = keyof typeof appliedStatsStrings.en;
