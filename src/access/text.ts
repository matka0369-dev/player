import type { Lang } from '../shared';

// These screens are for people who may not read well, so the wording is short
// and every screen leans on big buttons and icons. Kept here, not in the
// shared i18n file, because that file is vendored from the monorepo and
// overwritten on sync — and these strings only exist in this app.
//
// Translations other than English were written without a native-speaker
// review; worth a pass from someone who speaks each language.
export type AccessKey =
  | 'welcomeBack'
  | 'enterPin'
  | 'choosePin'
  | 'repeatPin'
  | 'pinMismatch'
  | 'wrongPin'
  | 'triesLeft'
  | 'locked'
  | 'linkInvalid'
  | 'register'
  | 'registerHint'
  | 'noAgent'
  | 'havePassword'
  | 'notYou'
  | 'tryAgain'
  | 'wait'
  | 'agentLoadFailed'
  | 'installApp';

type Dict = Record<AccessKey, string>;

const en: Dict = {
  welcomeBack: 'Welcome back',
  enterPin: 'Enter your PIN',
  choosePin: 'Choose a 4-digit PIN',
  repeatPin: 'Enter it again',
  pinMismatch: 'PINs did not match. Try again.',
  wrongPin: 'Wrong PIN',
  triesLeft: '{n} tries left',
  locked: 'Too many wrong tries. Ask your agent for a new link.',
  linkInvalid: 'This link has expired or was already used. Ask your agent for a new one.',
  register: 'Register on WhatsApp',
  registerHint: 'Message your agent to get your sign-in link.',
  noAgent: 'Open the link your agent sent you to register.',
  havePassword: 'I have a password',
  notYou: 'Not you?',
  tryAgain: 'Try again',
  wait: 'Please wait…',
  agentLoadFailed: 'Could not load your agent. Check your internet and try again.',
  installApp: 'Install the app',
};

const hi: Dict = {
  welcomeBack: 'वापसी पर स्वागत है',
  enterPin: 'अपना पिन डालें',
  choosePin: '4 अंकों का पिन चुनें',
  repeatPin: 'फिर से डालें',
  pinMismatch: 'पिन मेल नहीं खाए। फिर कोशिश करें।',
  wrongPin: 'गलत पिन',
  triesLeft: '{n} कोशिशें बाकी',
  locked: 'बहुत ज़्यादा गलत कोशिशें। अपने एजेंट से नया लिंक माँगें।',
  linkInvalid: 'यह लिंक खत्म हो चुका है या पहले इस्तेमाल हो चुका है। एजेंट से नया माँगें।',
  register: 'WhatsApp पर रजिस्टर करें',
  registerHint: 'साइन-इन लिंक पाने के लिए अपने एजेंट को मैसेज करें।',
  noAgent: 'रजिस्टर करने के लिए एजेंट का भेजा लिंक खोलें।',
  havePassword: 'मेरे पास पासवर्ड है',
  notYou: 'आप नहीं हैं?',
  tryAgain: 'फिर कोशिश करें',
  wait: 'कृपया रुकें…',
  agentLoadFailed: 'आपके एजेंट की जानकारी नहीं मिली। इंटरनेट जाँचें और फिर कोशिश करें।',
  installApp: 'ऐप इंस्टॉल करें',
};

const mr: Dict = {
  welcomeBack: 'पुन्हा स्वागत आहे',
  enterPin: 'तुमचा पिन टाका',
  choosePin: '4 अंकी पिन निवडा',
  repeatPin: 'पुन्हा टाका',
  pinMismatch: 'पिन जुळले नाहीत. पुन्हा प्रयत्न करा.',
  wrongPin: 'चुकीचा पिन',
  triesLeft: '{n} प्रयत्न शिल्लक',
  locked: 'खूप चुकीचे प्रयत्न. तुमच्या एजंटकडून नवीन लिंक मागा.',
  linkInvalid: 'ही लिंक कालबाह्य झाली आहे किंवा आधीच वापरली आहे. एजंटकडून नवीन मागा.',
  register: 'WhatsApp वर नोंदणी करा',
  registerHint: 'साइन-इन लिंक मिळवण्यासाठी तुमच्या एजंटला मेसेज करा.',
  noAgent: 'नोंदणीसाठी एजंटने पाठवलेली लिंक उघडा.',
  havePassword: 'माझ्याकडे पासवर्ड आहे',
  notYou: 'तुम्ही नाही?',
  tryAgain: 'पुन्हा प्रयत्न करा',
  wait: 'कृपया थांबा…',
  agentLoadFailed: 'तुमच्या एजंटची माहिती मिळाली नाही. इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.',
  installApp: 'अ‍ॅप इन्स्टॉल करा',
};

const te: Dict = {
  welcomeBack: 'మళ్లీ స్వాగతం',
  enterPin: 'మీ పిన్ ఎంటర్ చేయండి',
  choosePin: '4 అంకెల పిన్ ఎంచుకోండి',
  repeatPin: 'మళ్లీ ఎంటర్ చేయండి',
  pinMismatch: 'పిన్‌లు సరిపోలలేదు. మళ్లీ ప్రయత్నించండి.',
  wrongPin: 'తప్పు పిన్',
  triesLeft: '{n} ప్రయత్నాలు మిగిలి ఉన్నాయి',
  locked: 'చాలా తప్పు ప్రయత్నాలు. కొత్త లింక్ కోసం మీ ఏజెంట్‌ను అడగండి.',
  linkInvalid: 'ఈ లింక్ గడువు ముగిసింది లేదా ఇప్పటికే వాడబడింది. కొత్తది కోసం ఏజెంట్‌ను అడగండి.',
  register: 'WhatsApp లో రిజిస్టర్ చేయండి',
  registerHint: 'సైన్-ఇన్ లింక్ కోసం మీ ఏజెంట్‌కు మెసేజ్ చేయండి.',
  noAgent: 'రిజిస్టర్ చేయడానికి మీ ఏజెంట్ పంపిన లింక్ తెరవండి.',
  havePassword: 'నా దగ్గర పాస్‌వర్డ్ ఉంది',
  notYou: 'మీరు కాదా?',
  tryAgain: 'మళ్లీ ప్రయత్నించండి',
  wait: 'దయచేసి వేచి ఉండండి…',
  agentLoadFailed: 'మీ ఏజెంట్ వివరాలు లోడ్ కాలేదు. ఇంటర్నెట్ చూసి మళ్లీ ప్రయత్నించండి.',
  installApp: 'యాప్ ఇన్‌స్టాల్ చేయండి',
};

const ta: Dict = {
  welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
  enterPin: 'உங்கள் பின்னை உள்ளிடவும்',
  choosePin: '4 இலக்க பின்னைத் தேர்ந்தெடுக்கவும்',
  repeatPin: 'மீண்டும் உள்ளிடவும்',
  pinMismatch: 'பின்கள் பொருந்தவில்லை. மீண்டும் முயற்சிக்கவும்.',
  wrongPin: 'தவறான பின்',
  triesLeft: '{n} முயற்சிகள் மீதமுள்ளன',
  locked: 'பல தவறான முயற்சிகள். புதிய இணைப்புக்கு உங்கள் முகவரிடம் கேளுங்கள்.',
  linkInvalid: 'இந்த இணைப்பு காலாவதியானது அல்லது ஏற்கனவே பயன்படுத்தப்பட்டது. புதியதை முகவரிடம் கேளுங்கள்.',
  register: 'WhatsApp இல் பதிவு செய்யவும்',
  registerHint: 'உள்நுழைவு இணைப்புக்கு உங்கள் முகவருக்கு செய்தி அனுப்பவும்.',
  noAgent: 'பதிவு செய்ய உங்கள் முகவர் அனுப்பிய இணைப்பைத் திறக்கவும்.',
  havePassword: 'என்னிடம் கடவுச்சொல் உள்ளது',
  notYou: 'நீங்கள் இல்லையா?',
  tryAgain: 'மீண்டும் முயற்சிக்கவும்',
  wait: 'தயவுசெய்து காத்திருக்கவும்…',
  agentLoadFailed: 'உங்கள் முகவரின் விவரங்கள் கிடைக்கவில்லை. இணையத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  installApp: 'செயலியை நிறுவவும்',
};

const kn: Dict = {
  welcomeBack: 'ಮತ್ತೆ ಸ್ವಾಗತ',
  enterPin: 'ನಿಮ್ಮ ಪಿನ್ ನಮೂದಿಸಿ',
  choosePin: '4 ಅಂಕಿಯ ಪಿನ್ ಆಯ್ಕೆಮಾಡಿ',
  repeatPin: 'ಮತ್ತೊಮ್ಮೆ ನಮೂದಿಸಿ',
  pinMismatch: 'ಪಿನ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  wrongPin: 'ತಪ್ಪು ಪಿನ್',
  triesLeft: '{n} ಪ್ರಯತ್ನಗಳು ಉಳಿದಿವೆ',
  locked: 'ಹೆಚ್ಚು ತಪ್ಪು ಪ್ರಯತ್ನಗಳು. ಹೊಸ ಲಿಂಕ್‌ಗಾಗಿ ನಿಮ್ಮ ಏಜೆಂಟ್‌ರನ್ನು ಕೇಳಿ.',
  linkInvalid: 'ಈ ಲಿಂಕ್ ಅವಧಿ ಮುಗಿದಿದೆ ಅಥವಾ ಈಗಾಗಲೇ ಬಳಸಲಾಗಿದೆ. ಹೊಸದಕ್ಕಾಗಿ ಏಜೆಂಟ್‌ರನ್ನು ಕೇಳಿ.',
  register: 'WhatsApp ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ',
  registerHint: 'ಸೈನ್-ಇನ್ ಲಿಂಕ್‌ಗಾಗಿ ನಿಮ್ಮ ಏಜೆಂಟ್‌ಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ.',
  noAgent: 'ನೋಂದಾಯಿಸಲು ನಿಮ್ಮ ಏಜೆಂಟ್ ಕಳುಹಿಸಿದ ಲಿಂಕ್ ತೆರೆಯಿರಿ.',
  havePassword: 'ನನ್ನ ಬಳಿ ಪಾಸ್‌ವರ್ಡ್ ಇದೆ',
  notYou: 'ನೀವಲ್ಲವೇ?',
  tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
  wait: 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ…',
  agentLoadFailed: 'ನಿಮ್ಮ ಏಜೆಂಟ್ ವಿವರ ಸಿಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  installApp: 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
};

const DICTS: Record<Lang, Dict> = { en, hi, mr, te, ta, kn };

export function accessText(lang: Lang, key: AccessKey, params?: Record<string, string | number>): string {
  const raw = (DICTS[lang] ?? en)[key] ?? en[key];
  return params ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`)) : raw;
}
