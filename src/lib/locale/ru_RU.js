import en_US from './en_US'
import merge from 'deepmerge'

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
            orTryToFind: 'или попробуйте найти',
            exportToExcel: 'Экспорт в Excel',
        }
    }
}
const mergedLocale = merge(en_US, locale);
export default mergedLocale;