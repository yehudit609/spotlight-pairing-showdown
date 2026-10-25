# Spotlight Pairing Showdown

בנה לי אפליקציית הגרלה בעברית (כיווניות מימין לשמאל, RTL), שעובדת היטב גם בטלפון וגם במחשב.

מטרה: אני מזינה מראש רשימת שמות משתתפים (כ-30 שמות), שולחת קישור למישהי אחרת, והיא רק לוחצת "הגרל" ומקבלת 2 משתתפים שיתמודדו זה מול זה.

האפליקציה צריכה שני מסכים:

1. מסך ניהול (בשבילי):

- תיבת טקסט גדולה להזנת שמות, שם אחד בכל שורה. שורות ריקות ושמות כפולים מסוננים אוטומטית.

- מונה שמראה כמה שמות הוזנו.

- כפתור "שמור וצור קישור". הוא שומר את הרשימה ומייצר קישור ייחודי למסך ההגרלה, עם כפתור "העתק קישור".

- הרשימה חייבת להישמר כך שמי שפותח את הקישור ממכשיר אחר יראה אותה: במסד נתונים, או מקודדת בתוך הקישור עצמו. לא ב-localStorage בלבד.

- אפשרות לערוך את הרשימה אחר כך ולשמור שוב.

2. מסך הגרלה (מה שהיא רואה דרך הקישור):

- עיצוב נקי, חגיגי ומכובד, עם כותרת "הגרלת התמודדות" וכפתור גדול ובולט "הגרל".

- היא לא רואה את מסך הניהול ולא יכולה לערוך את הרשימה.

- בלחיצה על "הגרל":

  א. מופיעה ספירה לאחור גדולה במרכז המסך: 10, 9, 8 ... 1, ספרה אחת בכל שנייה, עם אנימציית שעון חול או עיגול שמתמלא סביב הספרה.

  ב. במהלך הספירה, ברקע או מתחת לספרה, מהבהבים שמות אקראיים מהרשימה במהירות, ליצירת מתח.

  ג. בסוף הספירה מוצגים בגדול שני השמות שנבחרו, זה מול זה, עם המילה "נגד" ביניהם. השמות נכנסים עם אנימציה יפה (הגדלה או החלקה), ומסביב יש אפקט קונפטי עדין.

- הבחירה אקראית לחלוטין ובלי חזרה: שני השמות תמיד שונים זה מזה.

- אחרי ההגרלה יש כפתור "הגרל שוב".

- מי שכבר נבחר לא ייבחר שוב בהגרלות הבאות, עד שלוחצים על כפתור "איפוס". אם נשאר רק משתתף אחד, מוצגת הודעה מתאימה.

- מתחת להגרלה מוצגת רשימה קטנה של ההתמודדויות שכבר הוגרלו.

עיצוב:

- גופנים עבריים יפים (למשל Frank Ruhl Libre לכותרות ו-Assistant לטקסט).

- צבעים: כחול עמוק וזהב על רקע בהיר.

- ללא תמונות של אנשים.

- כל הטקסטים בממשק בעברית.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://spotlight-pairing-showdown.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0f6bb56c-f8d0-54b1-a4ec-1f85299d6fa3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
