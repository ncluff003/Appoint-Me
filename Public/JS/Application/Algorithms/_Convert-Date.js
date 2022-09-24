import moment from 'moment';
import translate from 'translate';
import hijiri from 'moment-hijri';
import islamic from 'moment-islamic-civil';

export const getAmericanDate = (date, utility, user) => {
  return utility.americanDate.format(moment(date));
};

export const convertDate = (date, utility) => {
  console.log(date);
};

export const convertIslamicDate = (date) => {
  // moment.locale(`ar`);
  let m = moment(date).format('iYYYY/iM/iD');

  // console.log(m.replace(/i/g, ''));
  let splitArabicDate = m.split('/');
  // splitArabicDate.forEach(async (dateElement) => {
  //   let element = await translate(dateElement, { from: moment.locale(), to: `en` });
  //   translatedElements.push(element);
  // });
  let translatedElements = splitArabicDate.map(async (dateElement) => {
    return Number(await translate(dateElement.replace(/i/g, ''), { from: `ar`, to: `en` }));
  });
  // console.log(translatedElements);
  let joinedEnglishElements = translatedElements.join('/');
  let englishDate = moment(translatedElements.join('/')).format(`DD/MM/YYYY`);
  // console.log(m, translatedElements, joinedEnglishElements, englishDate);
};
