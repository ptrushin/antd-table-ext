import en_US from './en_US';
const merge = require('deepmerge');
const locale = {
  AntdTableExt: {
    Table: {
      column: 'Колонка',
      fix: 'Закрепить',
      onLeft: 'слева',
      onRight: 'справа',
      undefined: 'не задано',
      visibility: 'Видимость',
      common: 'Общее',
      resetToDefault: 'Сбросить к настройкам по умолчанию',
      empty: '(Пустые)',
      exclude: '(Кроме выбранных)',
      filter: 'Фильтровать',
      reset: 'Очистить',
      orTryToFind: 'или попробуйте найти'
    }
  }
};
const mergedLocale = merge(en_US, locale);
export default mergedLocale;