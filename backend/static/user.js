/* ============================================================
   DARAS — Multilingual conversational state machine
   ============================================================ */

/* ---------- LANGUAGE DICTIONARY ---------- */
const LANG = {
  brand:           {hi:"दारस", bn:"দারস", en:"DARAS"},
  brand_tag:       {hi:"आपका वित्तीय मित्र", bn:"আপনার আর্থিক বন্ধু", en:"Your Financial Companion"},
  nav_back:        {hi:"वापस", bn:"ফিরে যান", en:"Back"},

  step_welcome:    {hi:"शुरुआत", bn:"শুরু", en:"Welcome"},
  step_register:   {hi:"परिचय", bn:"পরিচয়", en:"About you"},
  step_ltype:      {hi:"लोन का प्रकार", bn:"ঋণের ধরন", en:"Loan type"},
  step_existing:   {hi:"मौजूदा लोन", bn:"বর্তমান ঋণ", en:"Existing loan"},
  step_satisfied:  {hi:"संतुष्टि", bn:"সন্তুষ্টি", en:"Satisfaction"},
  step_unhappy:    {hi:"समस्या", bn:"সমস্যা", en:"Concern"},
  step_calc:       {hi:"हिसाब", bn:"হিসাব", en:"Assessment"},
  step_result:     {hi:"नतीजा", bn:"ফলাফল", en:"Result"},
  step_new:        {hi:"नया लोन", bn:"নতুন ঋণ", en:"New loan"},
  step_ngo:        {hi:"मदद", bn:"সাহায্য", en:"Help"},
  step_end:        {hi:"शुक्रिया", bn:"ধন্যবাদ", en:"Thank you"},

  welcome_title:   {hi:"नमस्ते 🙏", bn:"নমস্কার 🙏", en:"Namaste 🙏"},
  welcome_promise: {hi:"मैं वादा करता हूँ — पारदर्शिता से, बिना किसी फ़ायदे के, आपको सही वित्तीय सलाह दूँगा। आपका नाम, नंबर सुरक्षित रहेगा।",
                    bn:"আমি প্রতিশ্রুতি দিচ্ছি — স্বচ্ছভাবে, কোনো স্বার্থ ছাড়াই, আপনাকে সঠিক আর্থিক পরামর্শ দেব। আপনার নাম, নম্বর সুরক্ষিত থাকবে।",
                    en:"I promise — transparently and without any agenda, I will guide you with honest financial advice."},
  welcome_privacy: {hi:"सिर्फ़ नाम और मोबाइल। आगे की जानकारी आप जब चाहें तभी।",
                    bn:"শুধু নাম এবং মোবাইল। বাকি তথ্য আপনি ইচ্ছে হলেই দেবেন।",
                    en:"Just name & mobile. Share more only when you wish to."},
  welcome_begin:   {hi:"आगे बढ़ें", bn:"শুরু করুন", en:"Let's begin"},

  /* --- Chronology behind the logo --- */
  story_label:     {hi:"दारस — लोगो की कहानी",
                    bn:"দারস — লোগোর গল্প",
                    en:"Daras — the story behind the logo"},
  story_mean:      {hi:"\"दारस\" = दिव्य दृष्टि",
                    bn:"\"দারস\" = দিব্য দৃষ্টি",
                    en:"\"Daras\" = divine sight"},
  story_body:      {hi:"हिंदी–उर्दू शब्द \"दारस\" का अर्थ है — झलक, ज्ञान पाने वाली दृष्टि। लोगो में बना त्रिकोण और आँख शिव के तीसरे नेत्र का प्रतीक है — अंतर्दृष्टि, ज्ञान और बदलाव। ऊपर का चमकता ग्लोब बताता है कि बदलती दुनिया में भी हम भारत के हर कोने तक पहुँचना चाहते हैं।",
                    bn:"হিন্দি-উর্দু শব্দ \"দারস\" মানে — এক ঝলক, জ্ঞান লাভের দৃষ্টি। লোগোর ত্রিভুজ ও চক্ষু শিবের তৃতীয় নয়ন — অন্তর্দৃষ্টি, প্রজ্ঞা ও রূপান্তরের প্রতীক। উপরের উজ্জ্বল গ্লোব বলছে — পরিবর্তনশীল পৃথিবীতে আমরা ভারতের প্রতিটি কোণে পৌঁছাতে চাই।",
                    en:"\"Daras\" is a Hindi-Urdu word meaning a glimpse — divine vision that grants knowledge. The triangle and eye echo Shiva's Third Eye: insight, wisdom and transformation. The glowing globe atop signals our reach across India in a fast-changing world."},
  story_more:      {hi:"और जानें — हम क्यों बने",
                    bn:"আরও জানুন — কেন তৈরি হলাম",
                    en:"Learn more — why we exist"},
  story_chrono:    {hi:"दारस की नींव माता-पिता की सीख पर पड़ी — पिता (एक चार्टर्ड अकाउंटेंट) ने पैसों की समझ और दूरदर्शिता सिखाई; माँ ने सिखाया कि कम संसाधनों वालों पर ही सबसे ज़्यादा बोझ पड़ता है। M3M Foundation और \"Tribes for Good\" के साथ काम करते हुए हमने देखा कि कैसे करोड़ों भारतीय कर्ज़-जाल में फँस जाते हैं। दारस इसी दिशा में एक छोटा-सा कदम है — \"Insight • Strategy • Growth\"।",
                    bn:"দারসের ভিত্তি বাবা-মায়ের শিক্ষায় — বাবা (একজন চার্টার্ড অ্যাকাউন্ট্যান্ট) অর্থের প্রজ্ঞা ও দূরদৃষ্টি শিখিয়েছেন; মা শিখিয়েছেন কম সংস্থানের মানুষেরাই সবচেয়ে বেশি বোঝা বহন করে। M3M Foundation ও \"Tribes for Good\"–এর সঙ্গে কাজ করতে গিয়ে দেখলাম কীভাবে কোটি কোটি ভারতীয় ঋণ-জালে আটকে পড়েন। দারস সেই পথেই এক ছোট পদক্ষেপ — \"Insight • Strategy • Growth\"।",
                    en:"Daras was born from parental wisdom — a father (a Chartered Accountant) who taught the power of foresight in money, and a mother who emphasised that those with the least bear the heaviest burden. Working with M3M Foundation and \"Tribes for Good\", we saw millions of Indians caught in the debt trap. Daras is a small step in that direction — \"Insight • Strategy • Growth\"."},

  reg_title:       {hi:"अपना परिचय दें", bn:"আপনার পরিচয় দিন", en:"Tell us about yourself"},
  reg_sub:         {hi:"सिर्फ़ नाम और मोबाइल काफ़ी है। बाकी आप जब चाहें तब बताएँ।",
                    bn:"শুধু নাম এবং মোবাইল যথেষ্ট। বাকি যখন ইচ্ছে তখন বলুন।",
                    en:"Just name and mobile is enough. Share the rest whenever you wish."},
  reg_name:        {hi:"नाम", bn:"নাম", en:"Name"},
  reg_name_ph:     {hi:"आपका पूरा नाम", bn:"আপনার পুরো নাম", en:"Your full name"},
  reg_age:         {hi:"उम्र", bn:"বয়স", en:"Age"},
  reg_age_ph:      {hi:"वर्षों में", bn:"বছরে", en:"In years"},
  reg_mobile:      {hi:"मोबाइल", bn:"মোবাইল", en:"Mobile"},
  reg_mobile_ph:   {hi:"10 अंक", bn:"১০ অঙ্ক", en:"10 digits"},
  reg_vocation:    {hi:"आप क्या काम करते हैं?", bn:"আপনি কী কাজ করেন?", en:"What is your work?"},
  reg_voc_custom:  {hi:"कौन-सा काम? (बताएँ)", bn:"কী কাজ? (বলুন)", en:"Specify your work"},
  reg_continue:    {hi:"आगे बढ़ें", bn:"এগিয়ে যান", en:"Continue"},

  reg_household:   {hi:"घर में कितने लोग हैं?", bn:"বাড়িতে কতজন আছেন?", en:"How many people in your household?"},
  hh_1_2:          {hi:"1–2 लोग", bn:"১–২ জন", en:"1–2 people"},
  hh_3_4:          {hi:"3–4 लोग", bn:"৩–৪ জন", en:"3–4 people"},
  hh_5_6:          {hi:"5–6 लोग", bn:"৫–৬ জন", en:"5–6 people"},
  hh_7plus:        {hi:"7 या ज़्यादा", bn:"৭ বা বেশি", en:"7 or more"},

  reg_employment:  {hi:"काम कैसा है?", bn:"কাজ কেমন?", en:"What type of work do you do?"},
  emp_permanent:   {hi:"पक्की नौकरी", bn:"স্থায়ী চাকরি", en:"Permanent job"},
  emp_daily:       {hi:"रोज़ की मज़दूरी", bn:"দৈনিক মজুরি", en:"Daily wage"},
  emp_seasonal:    {hi:"मौसमी काम", bn:"মৌসুমি কাজ", en:"Seasonal work"},
  emp_other:       {hi:"अन्य / दूसरा", bn:"অন্য / আলাদা", en:"Other"},
  emp_other_label: {hi:"काम बताएँ", bn:"কাজ বলুন", en:"Describe your work"},

  reg_bank:        {hi:"बैंक में खाता है?", bn:"ব্যাংকে অ্যাকাউন্ট আছে?", en:"Do you have a bank account?"},
  bank_yes:        {hi:"हाँ, है", bn:"হ্যাঁ, আছে", en:"Yes, I have one"},
  bank_no:         {hi:"नहीं है", bn:"নেই", en:"No"},

  voc_labour_s:    {hi:"मिस्त्री / कारीगर", bn:"মিস্ত্রি / কারিগর", en:"Skilled labour"},
  voc_labour_u:    {hi:"मज़दूरी", bn:"মজুরি", en:"Unskilled labour"},
  voc_thekedaar:   {hi:"ठेकेदार", bn:"ঠিকাদার", en:"Contractor"},
  voc_security:    {hi:"चौकीदार / सुरक्षा", bn:"দারোয়ান / সিকিউরিটি", en:"Watchman / Security"},
  voc_maid:        {hi:"घरेलू सहायिका", bn:"গৃহকর্মী", en:"House maid"},
  voc_business:    {hi:"अपना धंधा", bn:"নিজের ব্যবসা", en:"Own business"},
  voc_driver:      {hi:"ड्राइवर / कंडक्टर", bn:"ড্রাইভার / কন্ডাক্টর", en:"Driver / Conductor"},
  voc_other:       {hi:"और (बताएँ)", bn:"অন্য (বলুন)", en:"Other"},

  ltype_title:     {hi:"शुक्रिया, {name}", bn:"ধন্যবাদ, {name}", en:"Thank you, {name}"},
  ltype_trust:     {hi:"हम पर भरोसा दिखाने के लिए धन्यवाद। अब बताइए —",
                    bn:"আমাদের উপর ভরসা রাখার জন্য ধন্যবাদ। এখন বলুন —",
                    en:"Thanks for trusting us. Now tell me —"},
  ltype_question:  {hi:"आपका लोन पहले से है, या नया लोन चाहिए?",
                    bn:"আপনার ঋণ আগে থেকেই আছে, নাকি নতুন ঋণ দরকার?",
                    en:"Do you have an existing loan, or need a new one?"},
  ltype_existing:  {hi:"पुराना लोन है", bn:"পুরোনো ঋণ আছে", en:"I have a loan"},
  ltype_new:       {hi:"नया लोन चाहिए", bn:"নতুন ঋণ দরকার", en:"Need a new loan"},

  ex_title:        {hi:"आपका मौजूदा लोन", bn:"আপনার বর্তমান ঋণ", en:"Your existing loan"},
  ex_sub:          {hi:"अगर एक से ज़्यादा लोन हैं, तो नीचे \"+ एक और लोन\" से सब जोड़ें।",
                    bn:"একাধিক ঋণ থাকলে, নিচে \"+ আরও একটি ঋণ\" দিয়ে সব যোগ করুন।",
                    en:"If you have multiple loans, use \"+ Add another loan\" to add each one."},
  ex_amount:       {hi:"कुल लोन कितना है?", bn:"মোট ঋণ কত?", en:"Total loan amount"},
  ex_amount_ph:    {hi:"जैसे: 50000", bn:"যেমন: ৫০০০০", en:"e.g. 50000"},
  ex_purpose:      {hi:"किसलिए लिया है?", bn:"কীসের জন্য নিয়েছিলেন?", en:"Why did you take it?"},
  ex_source:       {hi:"किससे लिया है?", bn:"কার কাছ থেকে নিয়েছেন?", en:"From whom?"},
  ex_source_help:  {hi:"स्रोत के हिसाब से ब्याज और जोखिम बदलते हैं।",
                    bn:"উৎসের উপর সুদ ও ঝুঁকি নির্ভর করে।",
                    en:"Interest and risk depend heavily on the source."},
  ex_rate:         {hi:"ब्याज दर (% सालाना)", bn:"সুদের হার (% বার্ষিক)", en:"Interest rate (% p.a.)"},
  ex_rate_ph:      {hi:"जैसे: 18", bn:"যেমন: ১৮", en:"e.g. 18"},
  ex_remaining:    {hi:"कितना बाकी है?", bn:"কত বাকি আছে?", en:"How much is remaining?"},
  ex_remaining_ph: {hi:"कितना चुकाना बाकी", bn:"কত শোধ বাকি", en:"Amount still owed"},
  ex_gate_title:   {hi:"क्या आपका कोई लोन चल रहा है?", bn:"আপনার কি কোনো ঋণ চলছে?", en:"Do you have any running loans?"},
  ex_gate_sub:     {hi:"साहूकार, बैंक, दोस्त — किसी से भी।", bn:"সহুকার, ব্যাঙ্ক, বন্ধু — যে কারো কাছ থেকে।", en:"From a moneylender, bank, or friend — any loan counts."},
  ex_has_loan:     {hi:"हाँ, लोन है", bn:"হ্যাঁ, ঋণ আছে", en:"Yes, I have loans"},
  ex_no_loan:      {hi:"नहीं, कोई लोन नहीं", bn:"না, কোনো ঋণ নেই", en:"No, no loans"},
  ex_monthly_emi:  {hi:"हर महीने कुल EMI कितनी है?", bn:"প্রতি মাসে মোট EMI কত?", en:"Total monthly EMI across all loans?"},
  ex_monthly_emi_help:{hi:"सभी लोन मिलाकर, हर महीने जितना चुकाते हैं।", bn:"সব ঋণ মিলিয়ে প্রতি মাসে কত দেন।", en:"Combined EMI you pay every month across all loans."},
  nlc_title:       {hi:"आप क्या जानना चाहते हैं?", bn:"আপনি কী জানতে চান?", en:"What would you like to know?"},
  nlc_sub:         {hi:"दो रास्ते हैं।", bn:"দুটি পথ আছে।", en:"Two options."},
  nlc_max:         {hi:"मैं अधिकतम कितना लोन ले सकता हूँ?", bn:"আমি সর্বোচ্চ কত ঋণ নিতে পারি?", en:"What is the maximum loan I can safely take?"},
  nlc_max_sub:     {hi:"अपनी बचत के हिसाब से जानें", bn:"নিজের সঞ্চয় অনুযায়ী জানুন", en:"Based on your monthly savings"},
  nlc_check:       {hi:"यह लोन लेना सुरक्षित है?", bn:"এই ঋণ নেওয়া কি নিরাপদ?", en:"Is this specific loan safe to take?"},
  nlc_check_sub:   {hi:"एक खास रकम और ब्याज जाँचें", bn:"একটি নির্দিষ্ট পরিমাণ ও সুদ যাচাই করুন", en:"Check a specific amount and interest rate"},
  un_others:     {hi:"अन्य — बचत है फिर भी परेशानी है", bn:"অন্যান্য — সঞ্চয় আছে তবুও সমস্যা", en:"Others — have savings but still struggling"},
  un_others_sub: {hi:"मुझे किसी से बात करनी है", bn:"আমাকে কারো সাথে কথা বলতে হবে", en:"Need personal guidance"},
  open_new_loan:   {hi:"नया लोन लेना है →", bn:"নতুন ঋণ নিতে চাই →", en:"I want to take a new loan →"},
  nl_rate:         {hi:"ब्याज दर (% सालाना)", bn:"সুদের হার (% বার্ষিক)", en:"Interest rate (% p.a.)"},
  nl_source:       {hi:"कहाँ से लेना है?", bn:"কোথা থেকে নিচ্ছেন?", en:"From where are you taking it?"},
  ex_loan_label:   {hi:"लोन {n}", bn:"ঋণ {n}", en:"Loan {n}"},
  ex_add_loan:     {hi:"+ एक और लोन जोड़ें", bn:"+ আরও একটি ঋণ যোগ করুন", en:"+ Add another loan"},
  ex_loan_amt:     {hi:"रकम (₹)", bn:"পরিমাণ (₹)", en:"Amount (₹)"},
  ex_loan_rate:    {hi:"ब्याज (%)", bn:"সুদ (%)", en:"Interest (%)"},
  ex_loan_remain:  {hi:"बाकी रकम (₹)", bn:"বাকি পরিমাণ (₹)", en:"Remaining (₹)"},
  ex_loan_remove:  {hi:"हटाएँ", bn:"সরান", en:"Remove"},
  ex_sum_total:    {hi:"कुल कर्ज़", bn:"মোট ঋণ", en:"Total debt"},
  ex_sum_rate:     {hi:"सबसे ज़्यादा ब्याज", bn:"সর্বোচ্চ সুদ", en:"Highest interest"},

  purp_shaadi:     {hi:"शादी", bn:"বিয়ে", en:"Wedding"},
  purp_padai:      {hi:"पढ़ाई", bn:"পড়াশোনা", en:"Education"},
  purp_property:   {hi:"नई संपत्ति", bn:"নতুন সম্পত্তি", en:"New property"},
  purp_gaon:       {hi:"गाँव भेजना", bn:"গ্রামে পাঠানো", en:"Send to village"},
  purp_medical:    {hi:"बीमारी / इलाज", bn:"অসুখ / চিকিৎসা", en:"Medical"},
  purp_business:   {hi:"धंधा / दुकान", bn:"ব্যবসা / দোকান", en:"Business"},
  purp_vehicle:    {hi:"वाहन (बाइक/स्कूटर)", bn:"যান (বাইক/স্কুটি)", en:"Vehicle"},
  purp_other:      {hi:"और कोई कारण", bn:"অন্য কারণ", en:"Other"},

  src_informal:    {hi:"दोस्त / परिवार", bn:"বন্ধু / পরিবার", en:"Friends & family"},
  src_sahukaar:    {hi:"साहूकार / जमींदार", bn:"সহুকার / জমিদার", en:"Moneylender"},
  src_unsecured:   {hi:"असुरक्षित लोन (बहुत ज़्यादा ब्याज)", bn:"অসুরক্ষিত ঋণ (অনেক বেশি সুদ)", en:"Unsecured loan (very high rate)"},
  src_secured:     {hi:"गिरवी रखकर (बिना ठीक कागज़)", bn:"গচ্ছিত রেখে (ঠিক কাগজ ছাড়া)", en:"Secured (improper paperwork)"},
  src_personal:    {hi:"बैंक से पर्सनल लोन", bn:"ব্যাঙ্ক থেকে পার্সোনাল লোন", en:"Bank personal loan"},
  src_cc:          {hi:"क्रेडिट कार्ड", bn:"ক্রেডিট কার্ড", en:"Credit card"},
  src_microfin:    {hi:"माइक्रो-फ़ाइनेंस / बैंक", bn:"মাইক্রো-ফাইন্যান্স / ব্যাঙ্ক", en:"Microfinance / Bank"},
  src_msme:        {hi:"MSME / स्टार्ट-अप लोन", bn:"MSME / স্টার্ট-আপ ঋণ", en:"MSME / Startup"},
  src_gold:        {hi:"सोना गिरवी (Muthoot वग़ैरह)", bn:"সোনা গচ্ছিত (Muthoot ইত্যাদি)", en:"Gold loan (Muthoot etc.)"},
  src_employer:    {hi:"मालिक / कंपनी से", bn:"মালিক / কোম্পানি থেকে", en:"From employer"},
  src_education:   {hi:"शिक्षा लोन", bn:"শিক্ষা ঋণ", en:"Education loan"},
  src_other:       {hi:"और (बताएँ)", bn:"অন্য (বলুন)", en:"Other"},

  sat_title:       {hi:"क्या आप अपने मौजूदा लोन से संतुष्ट हैं?",
                    bn:"আপনি কি আপনার বর্তমান ঋণে সন্তুষ্ট?",
                    en:"Are you satisfied with your current loan?"},
  sat_sub:         {hi:"कोई भी जवाब सही है। बस सच्चाई से बताइए — मैं आपकी मदद के लिए हूँ।",
                    bn:"যে কোনো উত্তরই ঠিক। শুধু সত্যি বলুন — আমি আপনার সাহায্যে আছি।",
                    en:"Any answer is fine. Just be honest — I'm here to help."},
  sat_yes:         {hi:"हाँ, संतुष्ट हूँ", bn:"হ্যাঁ, সন্তুষ্ট", en:"Yes, satisfied"},
  sat_no:          {hi:"नहीं, समस्या है", bn:"না, সমস্যা আছে", en:"No, I have a concern"},

  open_title:      {hi:"क्या मैं और कोई मदद कर सकता हूँ?",
                    bn:"আমি কি আরও কিছু সাহায্য করতে পারি?",
                    en:"Can I help with anything else?"},
  open_sub:        {hi:"कोई भी सवाल लिखें — पैसों, बैंक, ब्याज, बचत — कुछ भी।",
                    bn:"যেকোনো প্রশ্ন লিখুন — টাকা, ব্যাঙ্ক, সুদ, সঞ্চয় — যা কিছু।",
                    en:"Ask anything — money, bank, interest, savings — anything."},
  open_ph:         {hi:"आप क्या जानना चाहते हैं?", bn:"আপনি কী জানতে চান?", en:"What would you like to know?"},
  open_submit:     {hi:"भेजें", bn:"পাঠান", en:"Send"},
  open_skip:       {hi:"अभी छोड़ें", bn:"এখন ছাড়ুন", en:"Skip for now"},

  end_title:       {hi:"सुन कर बहुत खुशी हुई 🙏", bn:"শুনে অনেক আনন্দ হলো 🙏", en:"So glad to hear that 🙏"},
  end_body:        {hi:"हम पर भरोसा दिखाने के लिए बहुत शुक्रिया। मैं आपका दोस्त हूँ — कभी भी मदद चाहिए, बिना झिझक इस ऐप पर आइए।",
                    bn:"আমাদের উপর ভরসা রাখার জন্য অনেক ধন্যবাদ। আমি আপনার বন্ধু — কখনো সাহায্য লাগলে নির্দ্বিধায় এই অ্যাপে আসুন।",
                    en:"Thank you for trusting us. I'm your friend — anytime you need help, come back without hesitation."},
  end_restart:     {hi:"शुरू से शुरू करें", bn:"আবার শুরু করুন", en:"Start over"},
  end_restart_grace:{hi:"शुक्रिया, समझ गया", bn:"ধন্যবাদ, বুঝলাম", en:"Thanks, got it"},

  un_title:        {hi:"किस बात से नाखुश हैं?", bn:"কী নিয়ে অসন্তুষ্ট?", en:"What's bothering you?"},
  un_sub:          {hi:"एक चुनिए — हम उसी पर बात करते हैं।", bn:"একটি বেছে নিন — সেটা নিয়ে কথা বলব।", en:"Pick one — we'll talk about that."},
  un_high:         {hi:"ज़्यादा ब्याज देना पड़ रहा है", bn:"অনেক সুদ দিতে হচ্ছে", en:"Interest is too high"},
  un_high_sub:     {hi:"Higher interest rate", bn:"Higher interest rate", en:"Higher interest rate"},
  un_emi:          {hi:"किस्त/EMI भर नहीं पा रहा", bn:"কিস্তি/EMI দিতে পারছি না", en:"Cannot pay EMI"},
  un_emi_sub:      {hi:"Cannot service EMI", bn:"Cannot service EMI", en:"Cannot service EMI"},
  un_prin:         {hi:"ब्याज तो दे रहा, मूल खत्म नहीं हो रहा", bn:"সুদ দিচ্ছি, কিন্তু আসল শেষ হচ্ছে না", en:"Paying interest but principal stuck"},
  un_prin_sub:     {hi:"Servicing interest but principal stuck", bn:"Servicing interest but principal stuck", en:"Servicing interest but principal stuck"},
  un_more:         {hi:"और पैसों की ज़रूरत है", bn:"আরও টাকার দরকার", en:"Need more money"},
  un_more_sub:     {hi:"Need more money", bn:"Need more money", en:"Need more money"},

  byaj_q_title:    {hi:"क्या आप ब्याज भी नहीं भर पा रहे?",
                    bn:"আপনি কি সুদও দিতে পারছেন না?",
                    en:"Are you unable to even pay the interest?"},
  byaj_q_sub:      {hi:"इस मुश्किल में मैं आपकी मदद करता हूँ। एक छोटे कैलकुलेटर से समझते हैं कि ऐसा क्यों हो रहा है।",
                    bn:"এই মুশকিলে আমি আপনার সাহায্য করি। একটা ছোট হিসাব করে বুঝি কেন এমন হচ্ছে।",
                    en:"Let me help you with this. Let's use a small calculator to understand why."},
  byaj_q_no:       {hi:"नहीं, ब्याज तो दे देता हूँ", bn:"না, সুদ তো দিয়ে দিই", en:"No, I do pay interest"},
  byaj_q_yes:      {hi:"हाँ, ब्याज भी मुश्किल है", bn:"হ্যাঁ, সুদও কঠিন", en:"Yes, even interest is hard"},

  ie_title:        {hi:"आपकी आमदनी और खर्च", bn:"আপনার আয় ও খরচ", en:"Your income & expenses"},
  ie_sub:          {hi:"हर महीने का अनुमान बताइए। सही जवाब से ही सही सलाह मिलेगी।",
                    bn:"প্রতি মাসের আনুমানিক বলুন। সঠিক উত্তরেই সঠিক পরামর্শ পাবেন।",
                    en:"Approximate monthly figures. Honest answers give honest advice."},
  ie_income:       {hi:"महीने की आमदनी (कुल)", bn:"মাসের আয় (মোট)", en:"Monthly income (total)"},
  ie_exp_title:    {hi:"खर्च (हर महीने)", bn:"খরচ (প্রতি মাস)", en:"Expenses (monthly)"},
  ie_rent:         {hi:"किराया / मकान", bn:"ভাড়া / বাড়ি", en:"Rent / Home"},
  ie_grocery:      {hi:"राशन / सामान", bn:"রেশন / জিনিসপত্র", en:"Groceries"},
  ie_medicine:     {hi:"दवाई / इलाज", bn:"ওষুধ / চিকিৎসা", en:"Medicine"},
  ie_education:    {hi:"पढ़ाई / स्कूल", bn:"পড়াশোনা / স্কুল", en:"Education"},
  ie_mobile:       {hi:"मोबाइल / बिजली", bn:"মোবাইল / বিদ্যুৎ", en:"Mobile / Utilities"},
  ie_gaon:         {hi:"गाँव भेजना", bn:"গ্রামে পাঠানো", en:"Send to village"},
  ie_other:        {hi:"और कोई खर्च", bn:"অন্য খরচ", en:"Other expenses"},
  ie_tenure:       {hi:"कितने महीने में चुकाना चाहते हैं?",
                    bn:"কত মাসে শোধ করতে চান?",
                    en:"In how many months would you repay?"},
  ie_tenure_help:  {hi:"सामान्यतः 6–60 महीने।", bn:"সাধারণত ৬–৬০ মাস।", en:"Usually 6–60 months."},
  ie_calc:         {hi:"हिसाब लगाएँ", bn:"হিসাব করুন", en:"Calculate"},

  r_income:        {hi:"आमदनी", bn:"আয়", en:"Income"},
  r_expense:       {hi:"खर्च", bn:"খরচ", en:"Expenses"},
  r_savings:       {hi:"बचत", bn:"সঞ্চয়", en:"Savings"},
  r_emi:           {hi:"अनुमानित EMI", bn:"আনুমানিক EMI", en:"Est. EMI"},
  r_after_emi:     {hi:"EMI के बाद बचत", bn:"EMI-র পর সঞ্চয়", en:"Left after EMI"},
  r_interest:      {hi:"कुल ब्याज", bn:"মোট সুদ", en:"Total interest"},
  r_payable:       {hi:"कुल चुकाना", bn:"মোট শোধ", en:"Total payable"},
  r_safe:          {hi:"सुरक्षित अधिकतम लोन", bn:"নিরাপদ সর্বোচ্চ ঋণ", en:"Max safe loan"},
  r_safe_badge:    {hi:"सुरक्षित सीमा", bn:"নিরাপদ সীমা", en:"Safe limit"},

  status_green:    {hi:"सुरक्षित", bn:"নিরাপদ", en:"Safe"},
  status_orange:   {hi:"सावधान", bn:"সাবধান", en:"Caution"},
  status_red:      {hi:"ख़तरा", bn:"বিপদ", en:"Danger"},

  act_new_loan:    {hi:"नया लोन देखें", bn:"নতুন ঋণ দেখুন", en:"Explore new loan"},
  act_again:       {hi:"फिर से जाँचें", bn:"আবার চেক করুন", en:"Re-check"},
  act_what_now:    {hi:"अब क्या करूँ?", bn:"এখন কী করব?", en:"What now?"},

  ag_title:        {hi:"अच्छी बात है — आप ब्याज दे सकते हैं",
                    bn:"ভালো কথা — আপনি সুদ দিতে পারেন",
                    en:"Good news — you can pay the interest"},
  ag_sub:          {hi:"तो फिर ब्याज क्यों नहीं दिया? क्या पैसों की कहीं और ज़रूरत है?",
                    bn:"তাহলে সুদ কেন দেননি? টাকা কি অন্য কোথাও দরকার?",
                    en:"Then why wasn't interest paid? Is money needed elsewhere?"},
  ag_yes:          {hi:"हाँ, नया लोन चाहिए", bn:"হ্যাঁ, নতুন ঋণ দরকার", en:"Yes, need a new loan"},
  ag_no:           {hi:"कुछ और बात है", bn:"অন্য কিছু আছে", en:"Something else"},

  ni_title:        {hi:"अब आप समझे — ऐसे में पैसे चुकाना मुश्किल है",
                    bn:"এখন বুঝলেন — এভাবে টাকা শোধ করা কঠিন",
                    en:"Now you see — it's hard to repay this way"},
  ni_sub:          {hi:"बताइए — क्या आपके पास कोई नई आमदनी का तरीका है? (कोई नया काम, साथ का काम)",
                    bn:"বলুন — আপনার কি নতুন আয়ের পথ আছে? (নতুন কাজ, পার্ট-টাইম কাজ)",
                    en:"Tell me — is there any new source of income? (extra work, side job)"},
  ni_yes:          {hi:"हाँ, है", bn:"হ্যাঁ, আছে", en:"Yes, there is"},
  ni_no:           {hi:"नहीं, कोई और रास्ता नहीं", bn:"না, অন্য কোনো উপায় নেই", en:"No, no other way"},

  ld_title:        {hi:"क्या जिनसे पैसे लिए थे, उनसे बात की?",
                    bn:"যাঁর কাছ থেকে টাকা নিয়েছিলেন, তাঁর সঙ্গে কথা বলেছেন?",
                    en:"Have you spoken to whoever lent you the money?"},
  ld_sub:          {hi:"कभी-कभी पुराने रिश्ते से ही समाधान निकल आता है।",
                    bn:"কখনো পুরানো সম্পর্ক থেকেই সমাধান বেরিয়ে আসে।",
                    en:"Often, old relationships find a way out."},
  ld_yes:          {hi:"हाँ, बात की है", bn:"হ্যাঁ, কথা বলেছি", en:"Yes, I have"},
  ld_no:           {hi:"अभी तक नहीं", bn:"এখনো না", en:"Not yet"},

  lp_title:        {hi:"पहले उनसे बात कीजिए", bn:"আগে তাঁর সঙ্গে কথা বলুন", en:"Talk to them first"},
  lp_body:         {hi:"पहले जिनसे पैसे लिए थे, उनसे अपनी तकलीफ बताइए। उनसे विकल्प पूछिए — किस्त छोटी हो सकती है, समय बढ़ सकता है। अगर बात न बने, तब किसी NGO से मिलिए।",
                    bn:"আগে যাঁর থেকে টাকা নিয়েছিলেন তাঁকে আপনার অসুবিধা বলুন। বিকল্প জিজ্ঞেস করুন — কিস্তি ছোট হতে পারে, সময় বাড়তে পারে। কথা না হলে কোনো NGO-র কাছে যান।",
                    en:"First, talk to your lender about your trouble. Ask for options — smaller EMI, longer tenure. If they refuse, then visit an NGO."},
  lp_ngo_btn:      {hi:"NGO का संपर्क देखें", bn:"NGO-র যোগাযোগ দেখুন", en:"See NGO contact"},
  lp_skip:         {hi:"समझ गया", bn:"বুঝলাম", en:"Got it"},

  ngo_title:       {hi:"अकेले मत जूझिए — मदद उपलब्ध है",
                    bn:"একা লড়বেন না — সাহায্য আছে",
                    en:"Don't struggle alone — help is available"},
  ngo_body:        {hi:"M3M फ़ाउंडेशन ज़रूरतमंद परिवारों की वित्तीय और आजीविका में मदद करता है। इनसे जल्द संपर्क कीजिए।",
                    bn:"M3M ফাউন্ডেশন প্রয়োজনগ্রস্ত পরিবারের আর্থিক ও জীবিকায় সাহায্য করে। দ্রুত যোগাযোগ করুন।",
                    en:"M3M Foundation supports families in financial distress with livelihood and counsel. Reach out soon."},
  ngo_name:        {hi:"M3M फ़ाउंडेशन", bn:"M3M ফাউন্ডেশন", en:"M3M Foundation"},
  ngo_sub:         {hi:"M3M India का CSR — वित्तीय समावेशन, आजीविका, महिला सशक्तिकरण",
                    bn:"M3M India-র CSR — আর্থিক অন্তর্ভুক্তি, জীবিকা, নারী ক্ষমতায়ন",
                    en:"CSR of M3M India — financial inclusion, livelihood, women empowerment"},
  ngo_note:        {hi:"यह जानकारी सिर्फ़ सूचना के लिए है। संपर्क संख्या बदल सकती है।",
                    bn:"এই তথ্য শুধু জ্ঞাপনের জন্য। যোগাযোগ নম্বর পরিবর্তন হতে পারে।",
                    en:"This is informational only. Contact details may change."},

  warn_title:      {hi:"पैसा उठाने का सबसे पहला उसूल", bn:"টাকা ধার নেওয়ার প্রথম নিয়ম", en:"First rule of borrowing"},
  warn_body:       {hi:"अगर ब्याज तक भी नहीं दे पाएँगे तो उधार मत लीजिए। आप फँस जाएँगे।",
                    bn:"যদি সুদই দিতে না পারেন, তাহলে ঋণ নেবেন না। আপনি ফেঁসে যাবেন।",
                    en:"If you can't even pay interest, don't borrow. You will get trapped."},
  warn_now:        {hi:"अभी आपकी आमदनी में और लोन लेना सही नहीं होगा।",
                    bn:"এই মুহূর্তে আপনার আয়ে আরও ঋণ নেওয়া ঠিক হবে না।",
                    en:"At your current income, taking more loan is not advisable."},
  warn_ngo:        {hi:"मदद के लिए NGO देखें", bn:"সাহায্যের জন্য NGO দেখুন", en:"See NGO for help"},
  warn_end:        {hi:"समझ गया", bn:"বুঝলাম", en:"Got it"},

  po_title:        {hi:"आपकी मौजूदा बचत से चुकाने में लगेगा",
                    bn:"আপনার বর্তমান সঞ্চয় থেকে শোধ করতে লাগবে",
                    en:"With your current savings, repayment will take"},
  po_ok:           {hi:"क्या यह समय-सीमा आपके लिए सही है?",
                    bn:"এই সময়সীমা কি আপনার জন্য ঠিক?",
                    en:"Is this timeline okay for you?"},
  po_yes:          {hi:"हाँ, ठीक है", bn:"হ্যাঁ, ঠিক", en:"Yes, that's fine"},
  po_no:           {hi:"नहीं, बदलना चाहता हूँ", bn:"না, পরিবর্তন করতে চাই", en:"No, want to change"},
  po_months:       {hi:"{n} महीने (~ {y} साल)", bn:"{n} মাস (~ {y} বছর)", en:"{n} months (~{y} yrs)"},
  po_cant:         {hi:"मौजूदा बचत से ब्याज भी पूरा नहीं हो रहा।",
                    bn:"বর্তমান সঞ্চয়ে সুদও পুরো হচ্ছে না।",
                    en:"Your current savings can't even cover the interest."},
  po_safe:         {hi:"बहुत बढ़िया — आप सुरक्षित हैं। आपके सुरक्षित भविष्य की कामना के साथ, इस ऐप पर आने के लिए धन्यवाद।",
                    bn:"খুব ভালো — আপনি নিরাপদ। আপনার সুরক্ষিত ভবিষ্যতের কামনায়, এই অ্যাপে আসার জন্য ধন্যবাদ।",
                    en:"Excellent — you are safe. Thank you for using this app — wishing you a secure future."},

  pp_title:        {hi:"क्या आप जल्दी चुकाना चाहते हैं या देर से?",
                    bn:"আপনি কি দ্রুত শোধ করতে চান, না কি ধীরে?",
                    en:"Want to repay quickly or slowly?"},
  pp_fast:         {hi:"जल्दी चुकाना", bn:"দ্রুত শোধ", en:"Repay fast"},
  pp_slow:         {hi:"देर से चुकाना", bn:"ধীরে শোধ", en:"Repay slow"},
  pp_months:       {hi:"नया समय (महीने)", bn:"নতুন সময় (মাস)", en:"New tenure (months)"},
  pp_calc:         {hi:"फिर से हिसाब लगाएँ", bn:"আবার হিসাব করুন", en:"Re-calculate"},

  nl_title:        {hi:"नया लोन — कुछ बातें", bn:"নতুন ঋণ — কিছু কথা", en:"New loan — some questions"},
  nl_sub:          {hi:"सही जगह से सही लोन लें — यही पहली समझदारी है।",
                    bn:"সঠিক জায়গা থেকে সঠিক ঋণ নিন — এটাই প্রথম বুদ্ধিমত্তা।",
                    en:"Right loan from the right source — that's the first wisdom."},
  nl_amount:       {hi:"कितना लोन चाहिए?", bn:"কত ঋণ দরকার?", en:"How much do you need?"},
  nl_purpose:      {hi:"किसलिए चाहिए?", bn:"কীসের জন্য?", en:"What for?"},
  nl_spoken:       {hi:"अब तक किससे बात की?", bn:"এখন পর্যন্ত কার সঙ্গে কথা বলেছেন?", en:"Whom have you spoken to so far?"},

  sp_none:         {hi:"अभी किसी से नहीं", bn:"এখনো কারও সঙ্গে না", en:"No one yet"},
  sp_family:       {hi:"परिवार / दोस्त", bn:"পরিবার / বন্ধু", en:"Family & friends"},
  sp_bank:         {hi:"बैंक", bn:"ব্যাঙ্ক", en:"Bank"},
  sp_sahukaar:     {hi:"साहूकार / जमींदार", bn:"সহুকার / জমিদার", en:"Moneylender"},
  sp_other:        {hi:"और किसी से", bn:"অন্য কারও সঙ্গে", en:"Someone else"},

  nm_title:        {hi:"देखते हैं आप कितना लोन आराम से ले सकते हैं",
                    bn:"দেখি আপনি কত ঋণ আরামে নিতে পারেন",
                    en:"Let's see how much loan you can comfortably take"},
  nm_sub:          {hi:"दो तरीक़े से जाँचते हैं — एक चुनिए।",
                    bn:"দুইভাবে চেক করি — একটি বেছে নিন।",
                    en:"Two ways to check — pick one."},
  nm_amount_title: {hi:"रकम + ब्याज + समय → क्या मैं चुका पाऊँगा?",
                    bn:"টাকা + সুদ + সময় → আমি কি শোধ করতে পারব?",
                    en:"Amount + rate + tenure → Can I repay?"},
  nm_amount_sub:   {hi:"Check feasibility for a specific amount", bn:"Check feasibility for a specific amount", en:"Check feasibility for a specific amount"},
  nm_savings_title:{hi:"मेरी बचत के हिसाब से अधिकतम कितना लोन?",
                    bn:"আমার সঞ্চয় অনুযায়ী সর্বোচ্চ কত ঋণ?",
                    en:"Based on my savings, what's the max safe loan?"},
  nm_savings_sub:  {hi:"Max safe loan from your savings", bn:"Max safe loan from your savings", en:"Max safe loan from your savings"},

  ns_title:        {hi:"अपनी बचत बताइए", bn:"আপনার সঞ্চয় বলুন", en:"Tell me your savings"},
  ns_sub:          {hi:"हर महीने जो बच जाता है, उसी से हम सुरक्षित अधिकतम लोन निकालेंगे।",
                    bn:"প্রতি মাসে যা বাঁচে, তা থেকেই নিরাপদ সর্বোচ্চ ঋণ বের করব।",
                    en:"From your monthly surplus, we'll find your max safe loan."},
  ns_savings:      {hi:"महीने की बचत", bn:"মাসের সঞ্চয়", en:"Monthly savings"},
  ns_rate:         {hi:"ब्याज दर (% सालाना)", bn:"সুদের হার (% বার্ষিক)", en:"Interest rate (% p.a.)"},
  ns_months:       {hi:"कितने महीने में चुकाना है?", bn:"কত মাসে শোধ?", en:"Repayment tenure (months)"},
  ns_calc:         {hi:"अधिकतम लोन देखें", bn:"সর্বোচ্চ ঋণ দেখুন", en:"Show max loan"},

  nsr_title:       {hi:"आपकी बचत से अधिकतम सुरक्षित लोन",
                    bn:"আপনার সঞ্চয় থেকে সর্বোচ্চ নিরাপদ ঋণ",
                    en:"Your max safe loan"},
  nsr_emi:         {hi:"लगभग EMI: ₹{emi} प्रति महीना",
                    bn:"আনুমানিক EMI: ₹{emi} প্রতি মাস",
                    en:"Approx EMI: ₹{emi} / month"},
  nsr_note:        {hi:"यह केवल सलाह है। आपातकाल के लिए बचत का कुछ हिस्सा अलग रखें।",
                    bn:"এটি কেবল পরামর্শ। জরুরি অবস্থার জন্য সঞ্চয়ের কিছু অংশ আলাদা রাখুন।",
                    en:"Advice only. Keep some savings aside for emergencies."},

  dc_title:        {hi:"क्या मैं सीधे आपकी मदद कर सकता हूँ?",
                    bn:"আমি কি সরাসরি আপনাকে সাহায্য করতে পারি?",
                    en:"Can I help you directly?"},
  dc_body:         {hi:"अगर आप चाहें, हम सीधे बात कर सकते हैं — एक काउंसलर आपकी समस्या समझेगा और बैंक/NGO के साथ रास्ता निकालेगा।",
                    bn:"আপনি চাইলে আমরা সরাসরি কথা বলতে পারি — একজন কাউন্সেলর আপনার সমস্যা বুঝে ব্যাঙ্ক/NGO-র সঙ্গে পথ বের করবেন।",
                    en:"If you wish, we can talk directly — a counsellor will understand and find a way with banks/NGOs."},
  dc_token:        {hi:"टोकन के तौर पर ₹100 — अगर हम आपकी समस्या हल नहीं कर पाए, तो पैसा वापस। यह सिर्फ़ इसलिए ताकि सच्ची ज़रूरत वाले लोग ही संपर्क करें।",
                    bn:"টোকেন হিসেবে ₹১০০ — যদি আমরা আপনার সমস্যা সমাধান করতে না পারি, টাকা ফেরত। শুধু এই কারণে যাতে সত্যিকারের প্রয়োজনের লোকেরাই যোগাযোগ করেন।",
                    en:"₹100 as a token — if we can't solve your problem, money refunded. This ensures only genuine cases reach out."},
  dc_talk:         {hi:"सीधे बात कीजिए", bn:"সরাসরি কথা বলুন", en:"Talk directly"},
  dc_skip:         {hi:"बाद में", bn:"পরে", en:"Later"},

  ft_brand:        {hi:"दारस DARAS — आपका वित्तीय मित्र", bn:"দারস DARAS — আপনার আর্থিক বন্ধু", en:"DARAS — Your financial companion"},
  ft_disc:         {hi:"यह ऐप केवल जानकारी और दिशा-निर्देश के लिए है। किसी भी वित्तीय निर्णय से पहले अपने सलाहकार से ज़रूर मिलें।",
                    bn:"এই অ্যাপ শুধুমাত্র তথ্য ও দিকনির্দেশের জন্য। যেকোনো আর্থিক সিদ্ধান্তের আগে আপনার পরামর্শদাতার সঙ্গে দেখা করুন।",
                    en:"For information & guidance only. Please consult a qualified advisor before any financial decision."},
  ft_privacy:      {hi:"गोपनीयता नीति", bn:"গোপনীয়তা নীতি", en:"Privacy Policy"},

  err_name:        {hi:"कृपया नाम लिखें", bn:"অনুগ্রহ করে নাম লিখুন", en:"Please enter your name"},
  err_voc:         {hi:"कृपया अपना काम चुनें", bn:"অনুগ্রহ করে আপনার কাজ বেছে নিন", en:"Please pick your work"},
  err_age:         {hi:"कृपया उम्र भरें", bn:"অনুগ্রহ করে বয়স লিখুন", en:"Please enter your age"},
  err_mobile:      {hi:"कृपया 10 अंकों का मोबाइल नंबर भरें", bn:"অনুগ্রহ করে ১০ সংখ্যার মোবাইল নম্বর দিন", en:"Please enter a 10-digit mobile number"},
  err_income:      {hi:"आमदनी ज़रूरी है", bn:"আয় প্রয়োজন", en:"Income is required"},
  err_exp_field:   {hi:"यह खर्च आपकी कुल आमदनी से ज़्यादा है। कृपया जाँचें।", bn:"এই খরচ আপনার মোট আয়ের বেশি। অনুগ্রহ করে দেখুন।", en:"This expense exceeds your total monthly income. Please recheck."},
  err_exp_total:   {hi:"कृपया जाँचें। आपके कुल खर्च, आमदनी से ज़्यादा हैं।", bn:"অনুগ্রহ করে দেখুন। আপনার মোট খরচ আয়ের বেশি।", en:"Please recheck your monthly expenses, it exceeds the Total Income."},
  err_amount:      {hi:"रकम भरें", bn:"টাকার পরিমাণ দিন", en:"Please enter amount"},
  err_rate:        {hi:"हर लोन की ब्याज दर भरें", bn:"প্রতিটি ঋণের সুদের হার দিন", en:"Enter interest rate for each loan"},
  err_remaining:   {hi:"हर लोन की बाकी रकम भरें", bn:"প্রতিটি ঋণের বকেয়া পরিমাণ দিন", en:"Enter remaining balance for each loan"},
  err_remaining_exceeds: {hi:"कृपया जाँचें। बाकी रकम, कुल लोन से ज़्यादा नहीं हो सकती।", bn:"অনুগ্রহ করে দেখুন। বাকি পরিমাণ মোট ঋণের বেশি হতে পারে না।", en:"Please check. Entered Remaining Amount is more than Actual Amount."},
  err_emi:         {hi:"मासिक EMI भरें", bn:"মাসিক EMI দিন", en:"Please enter your monthly EMI"},
  err_nl_rate:     {hi:"नए लोन की ब्याज दर भरें", bn:"নতুন ঋণের সুদের হার দিন", en:"Enter the interest rate for the new loan"},
  err_ns_rate:     {hi:"ब्याज दर भरें", bn:"সুদের হার দিন", en:"Please enter the interest rate"},
  saved:           {hi:"धन्यवाद — आपका सवाल हम तक पहुँच गया है।",
                    bn:"ধন্যবাদ — আপনার প্রশ্ন আমাদের কাছে পৌঁছেছে।",
                    en:"Thanks — your question has reached us."},

  rec_education:   {hi:"पढ़ाई के लिए हमेशा शिक्षा-लोन (Education Loan) सबसे सही — ब्याज कम, समय ज़्यादा। पर्सनल या असुरक्षित लोन से बचें।",
                    bn:"পড়াশোনার জন্য সবসময় শিক্ষা-ঋণ (Education Loan) সেরা — সুদ কম, সময় বেশি। ব্যক্তিগত বা অসুরক্ষিত ঋণ এড়িয়ে চলুন।",
                    en:"For education, an Education Loan is best — lower interest, longer tenure. Avoid personal or informal loans."},
  rec_property:    {hi:"संपत्ति के लिए बैंक/NBFC से लोन सबसे सुरक्षित। साहूकार से बचें — कागज़ धोखा हो सकता है।",
                    bn:"সম্পত্তির জন্য ব্যাঙ্ক/NBFC ঋণ সবচেয়ে নিরাপদ। সহুকার এড়িয়ে চলুন — কাগজে প্রতারণা হতে পারে।",
                    en:"For property, a Bank/NBFC loan is safest. Avoid moneylenders — paperwork fraud is common."},
  rec_business:    {hi:"धंधे के लिए MSME / स्टार्ट-अप लोन देखिए — कम ब्याज, सरकारी सहायता।",
                    bn:"ব্যবসার জন্য MSME / স্টার্ট-আপ ঋণ দেখুন — কম সুদ, সরকারি সাহায্য।",
                    en:"For business, look at MSME / Startup loans — lower interest, government support."},
  rec_vehicle:     {hi:"बाइक/स्कूटर — अगर मालिक से मिले तो सबसे बढ़िया (दोनों को फ़ायदा)। वरना बैंक/NBFC से।",
                    bn:"বাইক/স্কুটি — মালিকের কাছ থেকে পেলে সবচেয়ে ভালো (উভয়ের জন্য লাভ)। নইলে ব্যাঙ্ক/NBFC থেকে।",
                    en:"Vehicle — best from your employer (mutual benefit). Else from Bank/NBFC."},
  rec_medical:     {hi:"बीमारी में पर्सनल लोन / मेडिकल इमरजेंसी लोन देखिए। साहूकार से बिल्कुल मत लें।",
                    bn:"অসুখে পার্সোনাল ঋণ / মেডিকেল ইমার্জেন্সি ঋণ দেখুন। সহুকারের কাছ থেকে একদম নেবেন না।",
                    en:"For medical, look at Personal/Medical-Emergency loans. Never take from moneylenders."},
  rec_gold:        {hi:"अगर सोना है तो विश्वसनीय जगह (Muthoot, Manappuram) से ही गोल्ड लोन लें।",
                    bn:"সোনা থাকলে নির্ভরযোগ্য জায়গা (Muthoot, Manappuram) থেকেই গোল্ড লোন নিন।",
                    en:"If you have gold, take a Gold Loan only from trusted players (Muthoot, Manappuram)."},
  rec_default:     {hi:"बैंक से बात कीजिए — सबसे पारदर्शी और ब्याज भी कम। साहूकार से बचें।",
                    bn:"ব্যাঙ্কের সঙ্গে কথা বলুন — সবচেয়ে স্বচ্ছ এবং সুদও কম। সহুকার এড়িয়ে চলুন।",
                    en:"Speak to a bank — most transparent and lower interest. Avoid moneylenders."},

  welcome_returning:{hi:"पहले आए हैं? मोबाइल से ढूंढें",
                     bn:"আগে এসেছেন? মোবাইলে খুঁজুন",
                     en:"Visited before? Find by mobile"},
  ret_title:        {hi:"वापस आए — स्वागत है",   bn:"ফিরে এলেন — স্বাগতম",    en:"Welcome back"},
  ret_sub:          {hi:"अपना मोबाइल नंबर डालिए — हम आपकी पुरानी जानकारी ढूंढ लेते हैं।",
                     bn:"আপনার মোবাইল নম্বর দিন — আমরা আপনার পুরানো তথ্য খুঁজে নেব।",
                     en:"Enter your mobile — we'll find your previous record."},
  ret_find:         {hi:"ढूंढें",  bn:"খুঁজুন",   en:"Find"},
  ret_new_user:     {hi:"नया हूँ", bn:"নতুন",      en:"I'm new"},
  ret_not_found_t:  {hi:"नहीं मिला",   bn:"পাওয়া যায়নি", en:"Not found"},
  ret_not_found_b:  {hi:"इस नंबर से कोई जानकारी नहीं मिली। नया खाता बनाइए।",
                     bn:"এই নম্বরে কোনো তথ্য পাওয়া যায়নি। নতুন অ্যাকাউন্ট তৈরি করুন।",
                     en:"No record found for this number. Please register as new."},
  ret_found_hi:     {hi:"नमस्ते", bn:"নমস্কার", en:"Hello"},
  ret_found_sub:    {hi:"आपकी पुरानी जानकारी मिल गई। जारी रखें या नए सिरे से शुरू करें।",
                     bn:"আপনার পুরানো তথ্য পাওয়া গেছে। চালিয়ে যান বা নতুন করে শুরু করুন।",
                     en:"We found your previous record. Continue or start fresh."},
  ret_last_check:   {hi:"पिछली बार", bn:"শেষবার",  en:"Last visit"},
  ret_status:       {hi:"पिछला नतीजा", bn:"শেষ ফলাফল", en:"Last result"},
  ret_continue:     {hi:"जारी रखें",       bn:"চালিয়ে যান",  en:"Continue"},
  ret_fresh:        {hi:"नए सिरे से शुरू", bn:"নতুন করে শুরু করুন", en:"Start fresh"},
  ret_searching:    {hi:"ढूंढ रहे हैं…",  bn:"খুঁজছি…",     en:"Searching…"},

  dup_title:        {hi:"यह नंबर पहले से रजिस्टर है",    bn:"এই নম্বর আগে নথিভুক্ত হয়েছে",     en:"This number is already registered"},
  dup_profiles_sub: {hi:"इस नंबर से जुड़े प्रोफ़ाइल नीचे दिए गए हैं। आप किसे चुनना चाहते हैं?", bn:"এই নম্বরের সঙ্গে যুক্ত প্রোফাইল নিচে দেওয়া হলো। আপনি কোনটি বেছে নিতে চান?", en:"Profiles linked to this number are below. Who is using the app?"},
  dup_create_new:   {hi:"नई प्रोफ़ाइल बनाएँ", bn:"নতুন প্রোফাইল তৈরি করুন", en:"Add New Profile"},
  del_confirm_q:    {hi:"क्या सच में हटाएँ?", bn:"সত্যিই মুছবেন?", en:"Really delete?"},
  del_yes:          {hi:"हाँ, हटाएँ", bn:"হ্যাঁ, মুছুন", en:"Delete"},
  del_no:           {hi:"नहीं", bn:"না", en:"Cancel"},
};

/* ---------- VOCATIONS ---------- */
const VOCATIONS = [
  {k:"labour_skilled",   ic:"🛠️", l:"voc_labour_s"},
  {k:"labour_unskilled", ic:"💪", l:"voc_labour_u"},
  {k:"thekedaar",        ic:"📋", l:"voc_thekedaar"},
  {k:"security",         ic:"🛡️", l:"voc_security"},
  {k:"house_maid",       ic:"🧹", l:"voc_maid"},
  {k:"business",         ic:"🏪", l:"voc_business"},
  {k:"driver",           ic:"🚗", l:"voc_driver"},
  {k:"other",            ic:"✏️", l:"voc_other"},
];

const HOUSEHOLD_SIZES = [
  {k:"1_2",   ic:"👤", l:"hh_1_2"},
  {k:"3_4",   ic:"👥", l:"hh_3_4"},
  {k:"5_6",   ic:"👨‍👩‍👧", l:"hh_5_6"},
  {k:"7plus", ic:"🏘️",  l:"hh_7plus"},
];
const EMP_TYPES = [
  {k:"permanent", ic:"🏢", l:"emp_permanent"},
  {k:"daily",     ic:"🔨", l:"emp_daily"},
  {k:"seasonal",  ic:"🌾", l:"emp_seasonal"},
  {k:"other",     ic:"✏️",  l:"emp_other"},
];

const PURPOSES = ["shaadi","padai","property","gaon","medical","business","vehicle","other"];
const SOURCES  = ["informal","sahukaar","unsecured","secured","personal","cc","microfin","msme","gold","employer","education","other"];
const SPOKEN   = ["none","family","bank","sahukaar","other"];

/* ---------- STATE ---------- */
const S = {
  lang: (localStorage.getItem("daras-lang") || "hi"),
  userId: null, sessionId: null, _existingId: null,
  name: "", age: null, mobile: "", vocation: "", vocationCustom: "",
  householdSize: null, employmentType: null, hasBankAccount: null,
  loanType: null, // 'existing' | 'new'
  existing: { amount: 0, purpose: "", source: "", rate: 0, remaining: 0, monthly_emi: 0 },
  branch: null,
  income: 0, expenses: {}, tenure: 12,
  lastResult: null, paceMonths: 24,
  newLoan: { amount: 0, purpose: "", rate: 0, source: "", spoken: "" },
  history: ["s-welcome"],
};
window.S = S; // dev introspection

/* ---------- I18N ---------- */
function t(key, vars){
  let v = (LANG[key] && LANG[key][S.lang]) || (LANG[key] && LANG[key].en) || key;
  if (vars) Object.keys(vars).forEach(k => { v = v.replace(new RegExp("\\{"+k+"\\}","g"), vars[k]); });
  return v;
}
function applyLang(){
  document.documentElement.lang = S.lang;
  const vars = { name: S.name || "" };
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    const extra = el.getAttribute("data-i18n-vars");
    if (LANG[k]) el.textContent = t(k, extra ? {...vars, ...JSON.parse(extra)} : vars);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const k = el.getAttribute("data-i18n-placeholder");
    if (LANG[k]) el.placeholder = t(k, vars);
  });
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("on", b.dataset.lang === S.lang));
  // Re-render dynamic bits
  populateVocations(); populateHousehold(); populateEmpTypes(); populateSelects();
  if (S.lastResult) renderResult(S.lastResult);
}

/* ---------- NAV ---------- */
const STEP_FOR = {
  "s-welcome":"step_welcome","s-register":"step_register","s-ltype":"step_ltype",
  "s-existing":"step_existing","s-no-loan-choice":"step_ltype","s-satisfied":"step_satisfied","s-helpopen":"step_satisfied",
  "s-endgrace":"step_end","s-unhappy":"step_unhappy",
  "s-incexp":"step_calc","s-result":"step_result","s-after-green":"step_result",
  "s-newincome":"step_result","s-lender":"step_ngo","s-lender-prompt":"step_ngo",
  "s-ngo":"step_ngo","s-warning":"step_ngo","s-payoff":"step_result",
  "s-payoff-pace":"step_calc","s-new":"step_new","s-new-mode":"step_new",
  "s-new-savings":"step_calc","s-new-savings-result":"step_result","s-direct":"step_end"
};

function go(id, opts={}){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add("on");
  if (!opts.replace) S.history.push(id);
  window.scrollTo({top:0, behavior:"smooth"});
  const chip = document.getElementById("progress-chip").querySelector("span:last-child");
  chip.textContent = t(STEP_FOR[id] || "step_welcome");
  document.getElementById("back-btn").hidden = S.history.length <= 1 || id === "s-welcome";
  if (id === "s-existing") {
    if (!opts.replace) {
      // Fresh forward navigation — always reset to gate
      S.loanType = null;
      document.getElementById("ex-gate").style.display = "";
      document.getElementById("ex-form").style.display = "none";
      loanList.innerHTML = "";
      loanCount = 0;
    } else if (S.loanType === "existing") {
      // Back/restore — user already said yes, show the form
      document.getElementById("ex-gate").style.display = "none";
      document.getElementById("ex-form").style.display = "";
      if (!loanList.children.length) addLoanRow(true);
    } else {
      // Back/restore — show gate
      document.getElementById("ex-gate").style.display = "";
      document.getElementById("ex-form").style.display = "none";
      loanList.innerHTML = "";
      loanCount = 0;
    }
  }
  logEvent("screen_view", {screen:id, lang:S.lang});
  saveState();
}
function goBack(){
  if (S.history.length <= 1) return;
  // If on the loan form sub-view, Back goes to gate without leaving s-existing
  const cur = S.history[S.history.length-1];
  if (cur === "s-existing" && S.loanType === "existing") {
    S.loanType = null;
    S.history.pop(); // remove the duplicate s-existing pushed by btn-ex-yes
    document.getElementById("ex-gate").style.display = "";
    document.getElementById("ex-form").style.display = "none";
    document.getElementById("back-btn").hidden = S.history.length <= 1;
    saveState();
    return;
  }
  S.history.pop();
  const prev = S.history[S.history.length-1];
  go(prev, {replace:true});
}

/* ---------- TELEMETRY ---------- */
function logEvent(event, meta){
  fetch("/api/user/event", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({user_id: S.userId, event, meta: meta||{}})
  }).catch(()=>{});
}

/* ---------- POPULATE DROPDOWNS ---------- */
function populateVocations(){
  const grid = document.getElementById("vocation-grid");
  if (!grid) return;
  grid.innerHTML = "";
  VOCATIONS.forEach(v => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt-card" + (S.vocation === v.k ? " selected" : "");
    b.setAttribute("data-testid", "vocation-" + v.k);
    b.innerHTML = `<span class="ic">${v.ic}</span><span>${t(v.l)}</span>`;
    b.addEventListener("click", () => {
      if (S.vocation === v.k) {
        S.vocation = null;
        document.getElementById("vocation-custom-wrap").style.display = "none";
      } else {
        S.vocation = v.k; clearErr("err-voc");
        document.getElementById("vocation-custom-wrap").style.display = (v.k === "other" || v.k === "business") ? "block" : "none";
      }
      populateVocations();
    });
    grid.appendChild(b);
  });
}
function populateHousehold(){
  const grid = document.getElementById("household-grid");
  if (!grid) return;
  grid.innerHTML = "";
  HOUSEHOLD_SIZES.forEach(v => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt-card" + (S.householdSize === v.k ? " selected" : "");
    b.innerHTML = `<span class="ic">${v.ic}</span><span>${t(v.l)}</span>`;
    b.addEventListener("click", () => { S.householdSize = S.householdSize === v.k ? null : v.k; populateHousehold(); });
    grid.appendChild(b);
  });
}
function populateEmpTypes(){
  const grid = document.getElementById("emptype-grid");
  if (!grid) return;
  grid.innerHTML = "";
  EMP_TYPES.forEach(v => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt-card" + (S.employmentType === v.k ? " selected" : "");
    b.innerHTML = `<span class="ic">${v.ic}</span><span>${t(v.l)}</span>`;
    b.addEventListener("click", () => {
      S.employmentType = S.employmentType === v.k ? null : v.k;
      const wrap = document.getElementById("emptype-custom-wrap");
      if (wrap) wrap.style.display = S.employmentType === "other" ? "block" : "none";
      populateEmpTypes();
    });
    grid.appendChild(b);
  });
}
function populateSelects(){
  fillSel("nl-purpose", PURPOSES.map(p => ({v:p, l:"purp_"+p})));
  fillSel("nl-source",  SOURCES.map(p => ({v:p, l:"src_"+p})));
  loanList.querySelectorAll(".loan-row").forEach(row => {
    fillSelEl(row.querySelector(".loan-purpose"), PURPOSES.map(p => ({v:p, l:"purp_"+p})));
    fillSelEl(row.querySelector(".loan-source"),  SOURCES.map(p => ({v:p, l:"src_"+p})));
  });
}
function fillSelEl(el, opts){
  if (!el) return;
  const prev = el.value;
  el.innerHTML = "";
  opts.forEach(o => {
    const op = document.createElement("option");
    op.value = o.v; op.textContent = t(o.l);
    el.appendChild(op);
  });
  if (prev) el.value = prev;
}
function fillSel(id, opts){
  fillSelEl(document.getElementById(id), opts);
}

/* ---------- INLINE ERRORS ---------- */
function errText(key) {
  return LANG[key][S.lang] || LANG[key].en;
}
function showErr(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = errText(key);
  el.style.display = "block";
}
function clearErr(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = "none"; el.innerHTML = ""; }
}
function showErrEl(el, key) {
  if (!el) return;
  el.innerHTML = errText(key);
  el.style.display = "block";
}
function clearErrEl(el) {
  if (el) { el.style.display = "none"; el.innerHTML = ""; }
}

/* ---------- WIRE-UP ---------- */
document.querySelectorAll(".lang-btn").forEach(b => b.addEventListener("click", () => {
  S.lang = b.dataset.lang; localStorage.setItem("daras-lang", S.lang); applyLang();
  logEvent("lang_change", {lang:S.lang});
}));
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", e => {
  go(el.getAttribute("data-go"));
}));
document.getElementById("back-btn").addEventListener("click", goBack);

document.querySelectorAll(".yn-row").forEach(row => {
  row.addEventListener("click", e => {
    const btn = e.target.closest(".yn-btn");
    if (!btn) return;
    const wasSelected = btn.classList.contains("selected");
    row.querySelectorAll(".yn-btn").forEach(b => b.classList.remove("selected"));
    if (!wasSelected) btn.classList.add("selected");
  });
});

/* Clear inline errors when user starts correcting */
document.getElementById("in-name").addEventListener("input",        () => clearErr("err-name"));
document.getElementById("in-age").addEventListener("input",         () => clearErr("err-age"));
document.getElementById("in-mobile").addEventListener("input",      () => clearErr("err-mobile"));
document.getElementById("ex-monthly-emi").addEventListener("input", () => clearErr("err-emi"));
document.getElementById("btn-bank-yes").addEventListener("click", () => {
  S.hasBankAccount = S.hasBankAccount === true ? null : true;
});
document.getElementById("btn-bank-no").addEventListener("click", () => {
  S.hasBankAccount = S.hasBankAccount === false ? null : false;
});
document.getElementById("nl-amount").addEventListener("input",      () => clearErr("err-nl-amount"));
document.getElementById("nl-rate").addEventListener("input",        () => clearErr("err-nl-rate"));
document.getElementById("ns-rate").addEventListener("input",        () => clearErr("err-ns-rate"));

/* ---------- 1. WELCOME → REGISTER (handled by [data-go]) ---------- */

/* Clear all form fields + state when "Let's Begin" is clicked from welcome */
document.querySelector('[data-testid="welcome-begin-btn"]').addEventListener("click", () => {
  clearSavedState();
  S.userId = null; S.sessionId = null; S._existingId = null;
  S.name = ""; S.age = null; S.mobile = ""; S.vocation = ""; S.vocationCustom = "";
  S.householdSize = null; S.employmentType = null; S.hasBankAccount = null;
  document.getElementById("in-name").value = "";
  document.getElementById("in-age").value = "";
  document.getElementById("in-mobile").value = "";
  document.getElementById("in-vocation-custom").value = "";
  document.getElementById("vocation-custom-wrap").style.display = "none";
  document.getElementById("in-emptype-custom").value = "";
  document.getElementById("emptype-custom-wrap").style.display = "none";
  document.getElementById("profile-selection").style.display = "none";
  document.getElementById("btn-bank-yes").classList.remove("selected");
  document.getElementById("btn-bank-no").classList.remove("selected");
  populateVocations(); populateHousehold(); populateEmpTypes();
});

/* ---------- 2. REGISTER ---------- */


document.getElementById("btn-register").addEventListener("click", async () => {
  const name = document.getElementById("in-name").value.trim();
  ["err-name","err-age","err-mobile","err-voc"].forEach(clearErr);
  if (!name)       { showErr("err-name", "err_name"); return; }
  const age = parseInt(document.getElementById("in-age").value || 0);
  if (!age || age < 14 || age > 99) { showErr("err-age", "err_age"); return; }
  const mobile = document.getElementById("in-mobile").value.trim();
  if (!/^\d{10}$/.test(mobile)) { showErr("err-mobile", "err_mobile"); return; }
  if (!S.vocation) { showErr("err-voc", "err_voc"); return; }
  S.name = name;
  S.age = age;
  S.mobile = mobile;
  S.vocationCustom = document.getElementById("in-vocation-custom").value.trim();
  const empCustomEl = document.getElementById("in-emptype-custom");
  const empTypeCustom = (S.employmentType === "other" && empCustomEl) ? empCustomEl.value.trim() : "";

  const payload = {
    name: S.name, age: S.age, mobile: S.mobile,
    vocation: S.vocation, vocation_custom: S.vocationCustom,
    language: S.lang,
    household_size: S.householdSize,
    employment_type: S.employmentType === "other" && empTypeCustom ? empTypeCustom : S.employmentType,
    has_bank_account: S.hasBankAccount
  };
  if (S._existingId) payload.existing_user_id = S._existingId;

  try {
    const r = await fetch("/api/user/register", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const d = await r.json();

    if (d.exists) {
      const list = document.getElementById("profiles-list");
      list.innerHTML = "";

      function makeProfileCard(p) {
        const card = document.createElement("div");
        card.className = "profile-card";
        const customVoc = p.vocation === 'other' || p.vocation === 'business' ? (p.vocation_custom || 'Other') : '';
        const vocName = customVoc || t('voc_' + p.vocation) || p.vocation;
        const pAge = p.age ? ` (${p.age}Y)` : "";
        const initial = (p.name || "?").charAt(0).toUpperCase();
        card.innerHTML = `
          <div class="profile-card-row">
            <button class="profile-select">
              <span class="profile-avatar">${initial}</span>
              <span class="profile-info">
                <span class="profile-name">${p.name}${pAge}</span>
                <span class="profile-voc">${vocName}</span>
              </span>
            </button>
            <button class="profile-del-btn" aria-label="Delete profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
          <div class="profile-confirm">
            <span>${t("del_confirm_q")} <strong>${p.name}</strong>?</span>
            <button class="pc-yes">${t("del_yes")}</button>
            <button class="pc-no">${t("del_no")}</button>
          </div>
        `;

        card.querySelector(".profile-select").addEventListener("click", () => {
          S.userId         = p.id;
          S.sessionId      = p.session_id;
          S.name           = p.name;
          S.age            = p.age;
          S.mobile         = p.mobile;
          S.vocation       = p.vocation;
          S.vocationCustom = p.vocation_custom || "";
          if (p.language) { S.lang = p.language; localStorage.setItem("daras-lang", S.lang); }
          document.getElementById("in-name").value   = p.name;
          document.getElementById("in-age").value    = p.age || "";
          document.getElementById("in-mobile").value = p.mobile;
          document.getElementById("in-vocation-custom").value = p.vocation_custom || "";
          document.getElementById("vocation-custom-wrap").style.display = (p.vocation === "other" || p.vocation === "business") ? "block" : "none";
          populateVocations();
          document.getElementById("profile-selection").style.display = "none";
          applyLang();
          go("s-existing");
        });

        const delBtn = card.querySelector(".profile-del-btn");
        const confirmDiv = card.querySelector(".profile-confirm");
        delBtn.addEventListener("click", () => {
          confirmDiv.style.display = "flex";
          delBtn.style.visibility = "hidden";
        });
        card.querySelector(".pc-no").addEventListener("click", () => {
          confirmDiv.style.display = "none";
          delBtn.style.visibility = "";
        });
        card.querySelector(".pc-yes").addEventListener("click", async () => {
          try {
            await fetch(`/api/user/profile/${p.id}`, {method:"DELETE"});
            card.remove();
            if (!list.querySelector(".profile-card")) {
              document.getElementById("profile-selection").style.display = "none";
            }
          } catch(e) {}
        });

        return card;
      }

      d.profiles.forEach(p => list.appendChild(makeProfileCard(p)));
      document.getElementById("profile-selection").style.display = "flex";
      return;
    }

    if (d.success) {
      S.userId = d.user_id; S.sessionId = d.session_id;
      S._existingId = null;
    }
  } catch(e){}
  applyLang();
  go("s-existing");
});

document.getElementById("btn-create-new-profile").addEventListener("click", async () => {
  const payload = {
    name: S.name, age: S.age, mobile: S.mobile,
    vocation: S.vocation, vocation_custom: S.vocationCustom,
    language: S.lang,
    force_new: true
  };
  try {
    const r = await fetch("/api/user/register", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const d = await r.json();
    if (d.success) {
      S.userId = d.user_id; S.sessionId = d.session_id;
      S._existingId = null;
      document.getElementById("profile-selection").style.display = "none";
      applyLang();
      go("s-existing");
    }
  } catch(e){}
});

/* ---------- 3. EXISTING LOANS ---------- */
document.getElementById("btn-ex-no").addEventListener("click", () => {
  S.loanType = "new";
  S.existing = { amount: 0, purpose: "", source: "", rate: 0, remaining: 0, monthly_emi: 0 };
  logEvent("loan_type", {type:"new_none"});
  go("s-no-loan-choice");
});

document.getElementById("btn-ex-yes").addEventListener("click", () => {
  S.loanType = "existing";
  logEvent("loan_type", {type:"existing"});
  S.history.push("s-existing");
  document.getElementById("back-btn").hidden = false;
  document.getElementById("ex-gate").style.display = "none";
  document.getElementById("ex-form").style.display = "";
  if (!document.getElementById("loan-list").children.length) addLoanRow(true);
  saveState();
});

/* ---------- 4. EXISTING LOAN FORM ---------- */
const loanList = document.getElementById("loan-list");
let loanCount = 0;

function inrShort(n) {
  if (n >= 100000) return "₹" + (n/100000).toFixed(1) + " लाख";
  if (n >= 1000)   return "₹" + Math.round(n/1000) + "k";
  return "₹" + n;
}

function updateSummary() {
  const rows = loanList.querySelectorAll(".loan-row");
  if (rows.length < 2) { document.getElementById("loan-summary").style.display = "none"; return; }
  let total = 0, maxRate = 0;
  rows.forEach(row => {
    total   += parseFloat(row.querySelector(".loan-amount").value || 0);
    maxRate  = Math.max(maxRate, parseFloat(row.querySelector(".loan-rate").value || 0));
  });
  document.getElementById("sum-total").textContent = inrShort(total);
  document.getElementById("sum-rate").textContent  = maxRate;
  document.getElementById("loan-summary").style.display = "";
}

function addLoanRow(isFirst) {
  loanCount++;
  const n   = loanCount;
  const div = document.createElement("div");
  div.className = "loan-row";
  const removeBtn = isFirst ? "" :
    `<button class="btn-remove-loan" type="button" title="${t("ex_loan_remove")}">×</button>`;
  div.innerHTML = `
    <div class="loan-row-header">
      <span class="loan-row-label" data-i18n="ex_loan_label" data-i18n-vars='{"n":${n}}'>${t("ex_loan_label",{n})}</span>
      ${removeBtn}
    </div>
    <div class="field-grid">
      <div class="field rupee">
        <label data-i18n="ex_loan_amt">${t("ex_loan_amt")}</label>
        <input type="number" class="loan-amount" min="0" placeholder="50000"/>
      </div>
      <div class="field">
        <label><span data-i18n="ex_loan_rate">${t("ex_loan_rate")}</span><span class="req">*</span></label>
        <input type="number" class="loan-rate" min="0" step="0.5" placeholder="18" required/>
        <div class="field-err loan-err-rate"></div>
      </div>
    </div>
    <div class="field rupee">
      <label><span data-i18n="ex_loan_remain">${t("ex_loan_remain")}</span><span class="req">*</span></label>
      <input type="number" class="loan-remaining" min="0" placeholder="..."/>
      <div class="field-err loan-err-remaining"></div>
    </div>
    <div class="field">
      <label data-i18n="ex_purpose">${t("ex_purpose")}</label>
      <select class="loan-purpose"></select>
    </div>
    <div class="field">
      <label data-i18n="ex_source">${t("ex_source")}</label>
      <select class="loan-source"></select>
    </div>`;
  if (!isFirst) {
    div.querySelector(".btn-remove-loan").addEventListener("click", () => { div.remove(); updateSummary(); });
  }
  div.querySelectorAll("input").forEach(inp => inp.addEventListener("input", updateSummary));
  div.querySelector(".loan-rate").addEventListener("input", () => clearErrEl(div.querySelector(".loan-err-rate")));
  div.querySelector(".loan-remaining").addEventListener("input", () => clearErrEl(div.querySelector(".loan-err-remaining")));
  div.querySelectorAll(".loan-amount,.loan-remaining").forEach(inp => inp.addEventListener("input", () => clearErr("err-remaining-exceeds")));
  loanList.appendChild(div);
  fillSelEl(div.querySelector(".loan-purpose"), PURPOSES.map(p => ({v:p, l:"purp_"+p})));
  fillSelEl(div.querySelector(".loan-source"),  SOURCES.map(p => ({v:p, l:"src_"+p})));
}

document.getElementById("btn-add-loan").addEventListener("click", () => {
  addLoanRow(false);
  const rows = loanList.querySelectorAll(".loan-row");
  rows[rows.length - 1].querySelector(".loan-amount").focus();
});

document.getElementById("btn-existing-next").addEventListener("click", () => {
  const rows = loanList.querySelectorAll(".loan-row");
  let totalAmount = 0, maxRate = 0, totalRemaining = 0, hasEmpty = false, missingRate = false, missingRem = false, remExceeds = false;
  rows.forEach(row => {
    const amt  = parseFloat(row.querySelector(".loan-amount").value || 0);
    const rate = parseFloat(row.querySelector(".loan-rate").value || 0);
    const rem  = parseFloat(row.querySelector(".loan-remaining").value || 0);
    if (!amt)  { hasEmpty = true; return; }
    if (!rate) { missingRate = true; }
    if (!rem)  { missingRem = true; }
    if (rem > amt) { remExceeds = true; }
    totalAmount   += amt;
    maxRate        = Math.max(maxRate, rate);
    totalRemaining += rem || amt;
  });
  loanList.querySelectorAll(".loan-err-rate,.loan-err-remaining").forEach(clearErrEl);
  clearErr("err-emi");
  if (hasEmpty || !totalAmount) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      if (!parseFloat(row.querySelector(".loan-amount").value || 0))
        showErrEl(row.querySelector(".loan-err-rate"), "err_amount");
    });
    return;
  }
  if (missingRate) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      if (!parseFloat(row.querySelector(".loan-rate").value || 0))
        showErrEl(row.querySelector(".loan-err-rate"), "err_rate");
    });
    return;
  }
  if (missingRem) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      if (!parseFloat(row.querySelector(".loan-remaining").value || 0))
        showErrEl(row.querySelector(".loan-err-remaining"), "err_remaining");
    });
    return;
  }
  if (remExceeds) {
    showErr("err-remaining-exceeds", "err_remaining_exceeds");
    return;
  }
  const emi = parseFloat(document.getElementById("ex-monthly-emi").value || 0);
  if (!emi) { showErr("err-emi", "err_emi"); document.getElementById("ex-monthly-emi").focus(); return; }
  // Use the highest-rate loan's purpose/source as the primary signal
  let primaryPurpose = "", primarySource = "", primaryRate = -1;
  rows.forEach(row => {
    const rate = parseFloat(row.querySelector(".loan-rate").value || 0);
    if (rate >= primaryRate) {
      primaryRate   = rate;
      primaryPurpose = row.querySelector(".loan-purpose").value;
      primarySource  = row.querySelector(".loan-source").value;
    }
  });
  S.existing.amount      = totalAmount;
  S.existing.purpose     = primaryPurpose;
  S.existing.source      = primarySource;
  S.existing.rate        = maxRate;
  S.existing.remaining   = totalRemaining;
  S.existing.monthly_emi = emi;
  logEvent("existing_filled", {amount:totalAmount, source:S.existing.source, rate:maxRate, loan_count:rows.length});
  go("s-satisfied");
});

/* ---------- 4b. NO-LOAN CHOICE ---------- */
document.querySelectorAll("[data-nlc]").forEach(b => b.addEventListener("click", () => {
  const m = b.getAttribute("data-nlc");
  logEvent("no_loan_choice", {choice:m});
  if (m === "max") go("s-new-savings");
  else { S.loanType = "new"; go("s-new"); }
}));

/* ---------- 5. SATISFIED (handled by [data-go]) ---------- */

/* ---------- 6. OPEN QUESTION + NEW LOAN SHORTCUT ---------- */
document.getElementById("btn-open-new-loan").addEventListener("click", () => {
  S.loanType = "new";
  logEvent("helpopen_new_loan", {});
  go("s-new");
});

document.getElementById("btn-open-submit").addEventListener("click", async () => {
  const q = document.getElementById("open-q").value.trim();
  if (!q) { go("s-endgrace"); return; }
  try {
    await fetch("/api/user/question", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user_id: S.userId, question: q, context: {branch:S.branch, lang:S.lang} })
    });
  } catch(e){}
  alert(t("saved"));
  go("s-endgrace");
});

/* ---------- 8. UNHAPPY → BRANCH ---------- */
document.querySelectorAll("[data-set-branch]").forEach(b => b.addEventListener("click", () => {
  S.branch = b.getAttribute("data-set-branch");
  logEvent("branch", {branch:S.branch});
  if (S.branch === "high_interest") go("s-incexp");
  else if (S.branch === "cant_pay_emi") go("s-incexp");
  else if (S.branch === "principal_issue") go("s-incexp");
  else if (S.branch === "others") go("s-ngo");
  else if (S.branch === "need_more_money") {
    if (S.existing.amount > 0) {
      if (S.existing.rate >= 36) go("s-warning");
      else go("s-new");
    } else go("s-new");
  }
}));



/* ---------- 10. INCEXP → CALCULATE ---------- */
const IE_EXPENSE_FIELDS = [
  {id:"ie-rent",      errId:"err-ie-rent"},
  {id:"ie-grocery",   errId:"err-ie-grocery"},
  {id:"ie-medicine",  errId:"err-ie-medicine"},
  {id:"ie-education", errId:"err-ie-education"},
  {id:"ie-mobile-bill", errId:"err-ie-mobile"},
  {id:"ie-gaon",      errId:"err-ie-gaon"},
  {id:"ie-other",     errId:"err-ie-other"},
];
IE_EXPENSE_FIELDS.forEach(({id, errId}) => {
  document.getElementById(id).addEventListener("input", () => {
    clearErr(errId);
    clearErr("err-ie-total");
  });
});
document.getElementById("ie-income").addEventListener("input", () => clearErr("err-ie-total"));

document.getElementById("btn-calc").addEventListener("click", async () => {
  S.income = parseFloat(document.getElementById("ie-income").value || 0);
  if (!S.income) { alert(t("err_income")); return; }

  // Clear previous errors
  IE_EXPENSE_FIELDS.forEach(({errId}) => clearErr(errId));
  clearErr("err-ie-total");

  // Validate each field individually
  let hasFieldErr = false;
  IE_EXPENSE_FIELDS.forEach(({id, errId}) => {
    const val = parseFloat(document.getElementById(id).value || 0);
    if (val >= S.income) {
      showErr(errId, "err_exp_field");
      hasFieldErr = true;
    }
  });

  // Validate combined total
  const totalExp = IE_EXPENSE_FIELDS.reduce((sum, {id}) =>
    sum + parseFloat(document.getElementById(id).value || 0), 0);
  if (totalExp > S.income) {
    showErr("err-ie-total", "err_exp_total");
    return;
  }
  if (hasFieldErr) return;

  S.expenses = {
    rent:        parseFloat(document.getElementById("ie-rent").value || 0),
    grocery:     parseFloat(document.getElementById("ie-grocery").value || 0),
    medicine:    parseFloat(document.getElementById("ie-medicine").value || 0),
    education:   parseFloat(document.getElementById("ie-education").value || 0),
    mobile_bill: parseFloat(document.getElementById("ie-mobile-bill").value || 0),
    gaon:        parseFloat(document.getElementById("ie-gaon").value || 0),
    other_expenses: parseFloat(document.getElementById("ie-other").value || 0),
  };
  S.tenure = parseInt(document.getElementById("ie-tenure").value || 12);
  await runCalculate();
});

async function runCalculate(){
  // For new-loan checks: existing monthly EMI is an additional expense burden
  const existingEmi = (S.loanType === "new" && S.existing.monthly_emi > 0) ? S.existing.monthly_emi : 0;
  const payload = {
    user_id: S.userId,
    loan_type: S.loanType,
    loan_amount: S.existing.amount || S.newLoan.amount,
    loan_purpose: S.existing.purpose || S.newLoan.purpose,
    loan_source: S.existing.source || S.newLoan.source || "",
    interest_rate: S.existing.rate || 14,
    tenure_months: S.tenure,
    loan_remaining: S.existing.remaining || S.existing.amount || S.newLoan.amount,
    income: S.income, ...S.expenses,
    other_expenses: (S.expenses.other_expenses || 0) + existingEmi,
    vocation: S.vocation,
  };
  try {
    const r = await fetch("/api/user/calculate", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    S.lastResult = d;
    if (S.branch === "principal_issue") renderPayoff(d); else renderResultAndShow(d);
  } catch(e){ alert("Network error"); }
}

/* ---------- RESULT RENDERING ---------- */
function renderResultAndShow(d){
  renderResult(d);
  go("s-result");
}
function renderResult(d){
  const bubble = document.getElementById("result-bubble");
  bubble.classList.remove("danger","good","warm");
  if (d.status === "green") bubble.classList.add("good");
  else if (d.status === "red") bubble.classList.add("danger");
  else bubble.classList.add("warm");

  const badge = document.getElementById("result-badge");
  badge.className = "status-badge " + d.status;
  badge.textContent = t("status_" + d.status);

  document.getElementById("result-title").textContent = t("step_result");
  const msg = S.lang === "hi" ? d.message_hi : S.lang === "bn" ? d.message_bn : d.message_en;
  document.getElementById("result-message").textContent = msg;

  document.getElementById("r-income").textContent   = inr(d.income);
  document.getElementById("r-expense").textContent  = inr(d.expenses_total);
  const sv = document.getElementById("r-savings");
  sv.textContent = inr(d.monthly_savings);
  sv.className = "v " + (d.monthly_savings > 0 ? "green" : "red");
  document.getElementById("r-emi").textContent      = inr(d.emi);
  const ae = document.getElementById("r-after-emi");
  ae.textContent = inr(d.after_emi_savings);
  ae.className = "v " + (d.after_emi_savings > 0 ? "green" : "red");
  document.getElementById("r-interest").textContent = inr(d.total_interest);
  document.getElementById("r-payable").textContent  = inr(d.total_payable);
  document.getElementById("r-safe").textContent     = inr(d.max_safe_loan);

  // Actions depend on branch + status
  const acts = document.getElementById("result-actions");
  acts.innerHTML = "";
  if (S.branch === "high_interest" || S.branch === "cant_pay_emi") {
    if (d.status === "green") {
      acts.appendChild(mkBtn("ag_yes-go", t("ag_title"), "primary", () => go("s-after-green")));
    } else {
      acts.appendChild(mkBtn("redo-loop", t("ni_title").slice(0,40)+"…", "primary", () => go("s-newincome")));
    }
  } else {
    if (d.status === "red" || d.status === "orange") {
      acts.appendChild(mkBtn("ngo-go", t("warn_ngo"), "teal", () => go("s-ngo")));
    }
    acts.appendChild(mkBtn("again", t("act_again"), "ghost", () => go("s-incexp")));
    acts.appendChild(mkBtn("end", t("end_restart_grace"), "primary", () => go("s-endgrace")));
  }
}
function mkBtn(testid, label, kind, fn){
  const b = document.createElement("button");
  b.className = "btn " + (kind === "primary" ? "btn-primary" : kind === "teal" ? "btn-teal" : "btn-ghost");
  b.setAttribute("data-testid", "result-action-" + testid);
  b.textContent = label;
  b.addEventListener("click", fn);
  return b;
}

/* ---------- PAYOFF RENDERING (principal issue) ---------- */
function renderPayoff(d){
  const months = d.payoff_months_at_surplus;
  const badge = document.getElementById("payoff-badge");
  const num   = document.getElementById("payoff-num");
  const msg   = document.getElementById("payoff-msg");
  if (months < 0) {
    badge.className = "status-badge red";
    badge.textContent = t("status_red");
    num.textContent = "—";
    msg.textContent = t("po_cant");
  } else if (months === 0) {
    badge.className = "status-badge green";
    badge.textContent = t("status_green");
    num.textContent = "0";
    msg.textContent = t("po_safe");
  } else {
    const yrs = (months/12).toFixed(1);
    badge.className = "status-badge " + (months > S.tenure * 2 ? "orange" : "green");
    badge.textContent = t(months > S.tenure * 2 ? "status_orange" : "status_green");
    num.textContent = t("po_months", {n: months, y: yrs});
    msg.textContent = months > S.tenure * 2 ? t("ni_title") : t("po_safe");
  }
  go("s-payoff");
}

/* ---------- 12. AFTER-GREEN ---------- */
document.querySelectorAll("[data-go-after-green]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-after-green");
  logEvent("after_green", {ans:v});
  if (v === "yes") go("s-new"); else go("s-helpopen");
}));

/* ---------- 13. NEWINCOME ---------- */
document.querySelectorAll("[data-go-newincome]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-newincome");
  logEvent("new_income", {ans:v});
  if (v === "yes") {
    alert(S.lang === "hi" ? "अपनी नई आमदनी जोड़कर फिर हिसाब लगाएँ।" :
          S.lang === "bn" ? "নতুন আয় যোগ করে আবার হিসাব করুন।" :
                            "Add your new income and re-calculate.");
    go("s-incexp");
  } else {
    go("s-lender");
  }
}));

/* ---------- 14. LENDER ---------- */
document.querySelectorAll("[data-go-lender]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-lender");
  logEvent("lender_spoken", {ans:v});
  if (v === "yes") go("s-ngo"); else go("s-lender-prompt");
}));

/* ---------- 18-19. PAYOFF / PACE ---------- */
document.querySelectorAll("[data-go-payoff]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-payoff");
  logEvent("payoff_ok", {ans:v});
  if (v === "yes") go("s-helpopen"); else go("s-payoff-pace");
}));
document.querySelectorAll("[data-go-pace]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-pace");
  logEvent("pace", {ans:v});
  document.getElementById("pace-months").value = v === "fast" ? 12 : 36;
}));
document.getElementById("btn-pace-calc").addEventListener("click", () => {
  S.tenure = parseInt(document.getElementById("pace-months").value || 24);
  S.branch = "cant_pay_emi"; // route to standard result flow
  runCalculate();
});

/* ---------- 20. NEW LOAN ---------- */
document.getElementById("nl-purpose").addEventListener("change", updateRecommendation);
function updateRecommendation(){
  const p = document.getElementById("nl-purpose").value;
  const map = {
    padai:"rec_education", property:"rec_property", business:"rec_business",
    vehicle:"rec_vehicle", medical:"rec_medical"
  };
  const k = map[p] || "rec_default";
  document.getElementById("nl-recommend-text").textContent = t(k);
  document.getElementById("nl-recommend-box").style.display = "flex";
}
document.getElementById("btn-new-next").addEventListener("click", () => {
  S.newLoan.amount  = parseFloat(document.getElementById("nl-amount").value || 0);
  S.newLoan.purpose = document.getElementById("nl-purpose").value;
  S.newLoan.rate    = parseFloat(document.getElementById("nl-rate").value || 0);
  S.newLoan.source  = document.getElementById("nl-source").value;
  clearErr("err-nl-amount"); clearErr("err-nl-rate");
  if (!S.newLoan.amount) { showErr("err-nl-amount", "err_amount"); return; }
  if (!S.newLoan.rate)   { showErr("err-nl-rate", "err_nl_rate"); return; }
  // Merge new loan into S.existing so runCalculate() picks it up
  S.loanType = "new";
  S.existing = {
    amount: S.newLoan.amount, purpose: S.newLoan.purpose,
    source: S.newLoan.source, rate: S.newLoan.rate,
    remaining: S.newLoan.amount,
    monthly_emi: S.existing.monthly_emi || 0
  };
  S.branch = null;
  logEvent("new_loan_details", {...S.newLoan});
  go("s-incexp");
});

/* ---------- 23. NS-CALC ---------- */
document.getElementById("btn-ns-calc").addEventListener("click", async () => {
  const savings = parseFloat(document.getElementById("ns-savings").value || 0);
  const rate    = parseFloat(document.getElementById("ns-rate").value);
  const months  = parseInt(document.getElementById("ns-months").value || 24);
  if (!rate) { showErr("err-ns-rate", "err_ns_rate"); return; }
  try {
    const r = await fetch("/api/user/calculate_max", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ monthly_savings: savings, interest_rate: rate, tenure_months: months })
    });
    const d = await r.json();
    document.getElementById("nsr-num").textContent = inr(d.max_safe_loan);
    document.getElementById("nsr-emi").textContent = t("nsr_emi", {emi: Math.round(savings).toLocaleString("en-IN")});
    logEvent("ns_calc", {max:d.max_safe_loan, savings});
    go("s-new-savings-result");
  } catch(e){ alert("Network error"); }
});

/* ---------- UTILS ---------- */
function inr(n){
  const v = Math.round(Number(n)||0);
  return "₹" + v.toLocaleString("en-IN");
}

/* ---------- STATE PERSISTENCE ---------- */
const SAVE_KEY = "daras-v3-state";
let _restoringState = false;

function saveState() {
  if (_restoringState || !S.userId) return;
  try {
    const loanRows = [];
    loanList.querySelectorAll(".loan-row").forEach(row => {
      loanRows.push({
        amount:    row.querySelector(".loan-amount").value,
        rate:      row.querySelector(".loan-rate").value,
        remaining: row.querySelector(".loan-remaining").value,
        purpose:   row.querySelector(".loan-purpose").value,
        source:    row.querySelector(".loan-source").value,
      });
    });
    const exFormVisible = document.getElementById("ex-form").style.display !== "none";
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      userId: S.userId, sessionId: S.sessionId,
      name: S.name, age: S.age, mobile: S.mobile,
      vocation: S.vocation, vocationCustom: S.vocationCustom,
      householdSize: S.householdSize, employmentType: S.employmentType, hasBankAccount: S.hasBankAccount,
      loanType: S.loanType, existing: S.existing, branch: S.branch,
      income: S.income, expenses: S.expenses, tenure: S.tenure,
      lastResult: S.lastResult, paceMonths: S.paceMonths, newLoan: S.newLoan,
      history: S.history,
      loanRows,
      exFormVisible,
      exEmi:     document.getElementById("ex-monthly-emi").value,
      nlRate:    document.getElementById("nl-rate").value,
      nlPurpose: document.getElementById("nl-purpose").value,
      nlSource:  document.getElementById("nl-source").value,
      nsSavings: document.getElementById("ns-savings").value,
      nsRate:    document.getElementById("ns-rate").value,
      nsMonths:  document.getElementById("ns-months").value,
      nsMaxLoan: document.getElementById("nsr-num").textContent,
      nsEmiText: document.getElementById("nsr-emi").textContent,
    }));
  } catch(e) {}
}
window.addEventListener("beforeunload", saveState);

function clearSavedState() {
  localStorage.removeItem(SAVE_KEY);
}

function restoreState() {
  let snap;
  try { snap = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch(e) { return false; }
  if (!snap || !snap.userId) return false;

  const screen = (snap.history || []).slice(-1)[0] || "s-welcome";
  if (screen === "s-welcome") return false;

  _restoringState = true;
  Object.assign(S, {
    userId: snap.userId, sessionId: snap.sessionId,
    name: snap.name || "", age: snap.age, mobile: snap.mobile || "",
    vocation: snap.vocation || "", vocationCustom: snap.vocationCustom || "",
    householdSize: snap.householdSize, employmentType: snap.employmentType,
    hasBankAccount: snap.hasBankAccount,
    loanType: snap.loanType, existing: snap.existing || S.existing,
    branch: snap.branch, income: snap.income || 0,
    expenses: snap.expenses || {}, tenure: snap.tenure || 12,
    lastResult: snap.lastResult, paceMonths: snap.paceMonths || 24,
    newLoan: snap.newLoan || S.newLoan,
    history: snap.history || ["s-welcome"],
  });

  // Registration fields
  document.getElementById("in-name").value   = S.name;
  document.getElementById("in-age").value    = S.age || "";
  document.getElementById("in-mobile").value = S.mobile;
  document.getElementById("in-vocation-custom").value = S.vocationCustom;
  document.getElementById("vocation-custom-wrap").style.display =
    (S.vocation === "other" || S.vocation === "business") ? "block" : "none";
  populateVocations(); populateHousehold(); populateEmpTypes();

  // Income / expense fields
  document.getElementById("ie-income").value  = S.income || "";
  document.getElementById("ie-tenure").value  = S.tenure || 12;
  const expIds = {rent:"ie-rent", grocery:"ie-grocery", medicine:"ie-medicine",
    education:"ie-education", mobile:"ie-mobile-bill", gaon:"ie-gaon", other:"ie-other"};
  Object.entries(expIds).forEach(([k, id]) => {
    document.getElementById(id).value = (S.expenses[k] || "");
  });

  // New loan fields
  document.getElementById("nl-amount").value  = S.newLoan.amount || "";
  document.getElementById("nl-rate").value    = snap.nlRate || "";
  populateSelects();
  document.getElementById("nl-purpose").value = snap.nlPurpose || "";
  document.getElementById("nl-source").value  = snap.nlSource  || "";

  // Savings calculator fields + result
  document.getElementById("ns-savings").value = snap.nsSavings || "";
  document.getElementById("ns-rate").value    = snap.nsRate    || "14";
  document.getElementById("ns-months").value  = snap.nsMonths  || "24";
  if (snap.nsMaxLoan && snap.nsMaxLoan !== "₹—") document.getElementById("nsr-num").textContent = snap.nsMaxLoan;
  if (snap.nsEmiText) document.getElementById("nsr-emi").textContent = snap.nsEmiText;

  // Always restore loan rows into the DOM so Back from any later screen shows data
  if (snap.loanRows && snap.loanRows.length > 0) {
    loanList.innerHTML = "";
    loanCount = 0;
    snap.loanRows.forEach((lr, i) => {
      addLoanRow(i === 0);
      const row = loanList.querySelectorAll(".loan-row")[i];
      row.querySelector(".loan-amount").value    = lr.amount    || "";
      row.querySelector(".loan-rate").value      = lr.rate      || "";
      row.querySelector(".loan-remaining").value = lr.remaining || "";
      if (lr.purpose) row.querySelector(".loan-purpose").value = lr.purpose;
      if (lr.source)  row.querySelector(".loan-source").value  = lr.source;
    });
    document.getElementById("ex-monthly-emi").value = snap.exEmi || "";
    updateSummary();
  }

  // Navigate (go() will use S.loanType to decide gate vs form view)
  go(screen, {replace: true});
  S.history = snap.history;
  document.getElementById("back-btn").hidden = S.history.length <= 1 || screen === "s-welcome";

  if (S.lastResult) renderResult(S.lastResult);
  _restoringState = false;
  saveState();
  return true;
}

/* ---------- INIT ---------- */
applyLang();
if (!restoreState()) {
  go("s-welcome", {replace:true});
  S.history = ["s-welcome"];
}
// Count each new browser session as one visitor
if (!sessionStorage.getItem("daras-visited")) {
  sessionStorage.setItem("daras-visited", "1");
  logEvent("visit", {lang: S.lang});
}
