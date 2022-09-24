import moment from 'moment';
import translate from 'translate';
import hijiri from 'moment-hijri';
import islamic from 'moment-islamic-civil';
import * as Utility from './../Utility';

export const compareDateElements = async (dateElements, date, utility, user) => {
  // INITIALIZING UNIQUE CHARACTERS
  let arabicNumbers, persianNumbers, urduNumbers;

  // SETTING THE VALUES FOR THE UNIQUE CHARACTERS

  // ARABIC
  user.locale.split('-')[0] === `ar` ? (arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']) : null;

  // FARSI
  user.locale.split('-')[0] === `fa` || user.locale.split('-')[0] === `fas` || user.locale.split('-')[0] === `per` ? (persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']) : null;

  // URDU
  user.locale.split('-')[0] === `ur` || user.locale.split('-')[0] === `urd` ? (urduNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']) : null;
  let unAdulteratedAmericanDate = date.replace(/[,.]/g, '').split(' ');

  // TRANSLATING THE MONTH
  let monthTranslation = await Utility.getEnglishTranslation(dateElements[0], user);
  if (monthTranslation !== unAdulteratedAmericanDate[0]) return false;

  // CONVERTING ARABIC NUMBERS
  if (user.locale.split('-')[0] === `ar`) {
    dateElements[1] = dateElements[1]
      .split('')
      .map((digit, i) => (digit = arabicNumbers.indexOf(digit)))
      .join('');
    dateElements[2] = dateElements[2]
      .split('')
      .map((digit, i) => {
        if (arabicNumbers.indexOf(digit) !== -1) {
          return (digit = arabicNumbers.indexOf(digit));
        }
      })
      .join('');
  }

  // CONVERTING FARSI NUMBERS
  if (user.locale.split('-')[0] === `fa` || user.locale.split('-')[0] === `fas` || user.locale.split('-')[0] === `per`) {
    dateElements[1] = dateElements[1]
      .split('')
      .map((digit, i) => (digit = persianNumbers.indexOf(digit)))
      .join('');
    dateElements[2] = dateElements[2]
      .split('')
      .map((digit, i) => {
        if (persianNumbers.indexOf(digit) !== -1) {
          return (digit = persianNumbers.indexOf(digit));
        }
      })
      .join('');
  }

  // CONVERTING URDU NUMBERS
  if (user.locale.split('-')[0] === `ur` || user.locale.split('-')[0] === `urd`) {
    dateElements[1] = dateElements[1]
      .split('')
      .map((digit, i) => (digit = urduNumbers.indexOf(digit)))
      .join('');
    dateElements[2] = dateElements[2]
      .split('')
      .map((digit, i) => {
        if (urduNumbers.indexOf(digit) !== -1) {
          return (digit = urduNumbers.indexOf(digit));
        }
      })
      .join('');
  }

  console.log(dateElements, date, unAdulteratedAmericanDate);
  console.log(Number(utility.englishNumber.format(dateElements[1]).replace(/,./g, '')), dateElements[2].replace(/[,.]/g, ''));
  // VALIDATING DATE
  if (Number(utility.englishNumber.format(dateElements[1]).replace(/,./g, '')) !== Number(unAdulteratedAmericanDate[1])) return false;

  // VALIDATING YEAR
  if (dateElements[2].replace(/[,.]/g, '') !== unAdulteratedAmericanDate[2]) return false;

  // RETURNS TRUE IF ALL CHECKS OUT
  return true;
};
