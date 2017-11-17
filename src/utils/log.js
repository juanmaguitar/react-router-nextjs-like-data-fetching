import moment from 'moment'

export default section => msg => {
  console.log(`🕗 ${moment().format('h:mm:ss')} ${section} : ${msg}`);
}