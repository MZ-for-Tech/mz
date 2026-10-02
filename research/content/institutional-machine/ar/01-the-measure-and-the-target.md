في عام 1975 صاغ الاقتصادي البريطاني تشارلز جودهارت ما يمكن اعتباره أهم مقولة في عالم أمان الذكاء الاصطناعي:

> «أي دقة إحصائية مُلاحظة ستنهار وقتما تضع عليها الضغط لغرض التحكم» (جودهارت، 1975)

وتقول عالمة الأنثروبولوجيا مارلين ستازرن:

> «عندما يصبح المقياس هدفا، يسهل أن يكون مقياسا جيدا.» (ستازرن، 1997)

**1. من ملاءمة العينة الداخلية إلى التنبؤ بالعينة المحجوزة**

سيشعر الإحصائيون التقليديون بالإهانة عندما تذكر المقياس الكلي" الذي يقيس كل شئ" خذ ال $R^2$ كمثال، لقد اُبتكرت بسبب الحاجة للرقم أو مقياس محدد يخبرنا بكم التغير للمتغير التابع الذي  فسره النموذج.

و هنا أتى الإدراك أنه كلما زدنا المتغيرات المفسرة في النموذج يصبح من السهل أن يتضخم هذا المقياس فيصبح مضللا إلي حد ما فيزيد أو يظل ثابتا ال $R^2$ في العينة حتى إذا كانت لا تضيف إضافة مفسرة حقيقية.

<!-- visual:r2-inflation -->

لذلك قرروا أن يأتوا بأقوى سلاح إحصائي لديهم و قد كانت درجات الحرية و لكن هل ينبغي إدخال ميزة غير ذات صلة؟ درجات الحرية تعقد الأمور بلا طائل حقيقي و بذلك تصبح مقياسا محافظا إلي حد كبير وتقلل قابلية التعميم خارج العينة

ال AIC و الBIC و ال $R^2$ المحسوب باستخدام التحقق المتقاطع حاولت حل المشكلة الأكبر من اتجاهات مختلفة و كل واحدة تسعى لتميز أداء النموذج ذي الدلالة من الملاءمة الموجودة فقط في البيانات المتاحة (أكاييك، 1974; شوارتز 1978)

عندما ظهر تعلم الآلة على الساحة حولت معظم الاهتمام من التقدير ، و تفسير العلاقات نحو تحسين الأداء التنبؤي خارج العينة.

تخيل معي شركة تحاول فهم المحفز للمبيعات: قد تساعدك ال p-values وفترات الثقة الإجابة على السؤال الاستدلالي لكن الشركة تحتاج إلى معرفة مقدار المبيعات في الربع الرابع، هنا سنجعل للتنبؤ الأولوية و قد يكون هنا أكثر إفادة فقد يُناسب نموذج الانحدار الخطي عالم البيانات الذي يُطلب منه نمذجة تلك المبيعات. أما إذا كانت المهمة تقتصر على التنبؤ بالمبيعات من متغيرات محددة، فإن مشكلة ال $R^2$ تصبح أقل أهمية في حد ذاتها.

و نقوم  بتقسيم البيانات إلى بيانات التدريب والاختبار والتحقق. وعلى نطاق صغير، يساعد هذا الفصل في حمايتنا من خداع أنفسنا.

**2. طبقتان وسيطتان في التعلم المعزز بناء على رد فعل بشري**

ولكن ماذا يحدث حين تكبر المشكلة؟ التركيز هو كل ما تريد غيرت شكل مجال الذكاء الاصطناعي منذ عام 2017 ( فاسواني، 2017)

لقد كانت هذه السنة محورية لديب مايند التابع لجوجل و في نفس السنة على مسافة بضع حارات منهم سأل مختبر صغير غير ربحي يدعى openAI سؤالا هاما : كيف نوصل الأهداف لنظام الذكاء الاصطناعي في حين أننا نجد صعوبة في كتابة دالة المكافأة؟
نتاج هذا الجهد المشترك سيكون ورقة تدعى التعلم المعزز من التفضيلات البشرية و التي ستصبح أساس نهج التعلم المعزز من خلال رد الفعل البشري (كريستيانو وآخرون، 2017).

بحلول عام 2022 جلب ChatGPT نماذج لغوية كبيرة إلى الناس العاديين ليس فقط المهتمين بالذكاء الاصطناعي و أصبح تجاريا ، وأصبح قانون جودهارت أكثر أهمية (OpenAI، 2022).

وبدأت الدائرة فأنت تقوم بإنشاء درجات تفضيل بشرية لأن الخسارة لا تعكس الفائدة. ثم تُحسن النماذج بناءً على درجات التفضيل هذه.

و بعدها تقوم بإنشاء نماذج المكافأة لأن البشر لا يستطيعون تقييم ملايين العينات. ثم تكتشف السياسات نقاط الضعف في نموذج المكافأة (كريستيانو وآخرون، 2017؛ إيفيموف، 2025؛ أويانغ وآخرون، 2022).

<!-- visual:double-goodhart -->

على الرغم من بساطة التعلم المعزز بناء على رد الفعل البشري و لكنه يكسر قانون جودهارت مرتين، أولهما عندما  يتم تدريب نموذج مكافأة مخصص لتوقع ما يفضله المقيمون البشريون. بعد ذلك، يتم تحسين نموذج اللغة مباشرةً بناءً على هذا النموذج.

وهكذا، ينتهي الأمر بالتركيز على تمثيل تفضيلات المستخدم بدلاً من نواياه الحقيقية (أويانغ وآخرون، 2022). وفي الفجوة بين المؤشر والهدف الأساسي، يصبح التلاعب بالمكافآت ممكناً؛ إذ قد تظهر تشوهات أكثر دقة، كالتملق وسلوكيات إرضاء المُقيِّم، عندما تُكافأ هذه السلوكيات بموثوقية أكبر من الشيء الذي أردنا قياسه فعلياً (غاو وآخرون، 2023؛ شارما وآخرون، 2024).

وعلى نطاق البحث، حتى المعيار نفسه قد يصبح هدفاً في نهاية المطاف.

**3. عندما يصبح المعيار هدفا**

تُنشئ مجموعة اختبار منفصلة لأن أداء التدريب قابل للتلاعب.

ولكن بمجرد إعادة استخدام نفس المعيار في الأبحاث والهياكل والقرارات البحثية لسنوات، يبدأ الباحثون بشكل غير مباشر في تحسين الأداء بناءً عليه أيضًا. وفي النهاية، يصبح المعيار نفسه جزءًا غير مباشر من عملية التطوير.

 وفي عصر نماذج اللغة الكبيرة (LLMs)، اكتسبت هذه المشكلة اسمًا غير جاد لمشكلة خطيرة: تحسين الأداء المعياري. فأي معيار يصبح هو المعيار الرائد، يصبح هو أيضًا الهدف الذي يجب تحسينه. مثلما كان ال $R^2$

و النتيجة : نموذج يبدو أكثر كفاءة مما هو عليه في الواقع. يصبح معيار MMLU أو HumanEval أو GSM8K أو SWE-bench أو أي معيار آخر يهيمن على قائمة المتصدرين الحالية ذا أهمية تجارية.

<!-- visual:benchmaxxing -->

تُجمع البيانات حول مهام معيارية، وتُستند القرارات اللاحقة للتدريب إلى تحركات لوحة المتصدرين، وفي نهاية المطاف، يصبح التمييز بين "لقد بنينا نموذجًا أفضل" و"لقد بنينا نموذجًا أفضل في الاختبارات التي يتابعها الجميع" أمرًا بالغ الصعوبة (أختار وآخرون، 2026؛ تشين وآخرون، 2026).

لا تكمن المشكلة الأعمق في التلاعب بالمعايير، بل في أننا بمجرد التلاعب بها، نفقد القدرة على تقييم التقييم نفسه. فالطالب الذي يغش في الامتحان يحصل على درجة عالية، ولا يعود الامتحان قادرًا على إخبارنا بما كان يُفترض أن يُخبرنا به.

**4. مشكلة قديمة على نطاق جديد**

وبالتالي فإن المشكلة ليست مشكلة تعلم آلي فريدة من نوعها بقدر ما هي مشكلة قديمة مع تطبيق مُحسِّن جديد: قانون جودهارت المطبق على نطاق حسابي (مانهايم وجارابانت، 2018).

و هنا نطرح السؤال: ماذا لو كانت العديد من المشاكل التي نسميها الآن "مواءمة الذكاء الاصطناعي" هي مشاكل قديمة تتعلق بالقياس والحوافز والمعلومات والتحكم \- ولكن مع وجود مُحسِّن أكثر قوة على الجانب الآخر؟

**المراجع**

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
