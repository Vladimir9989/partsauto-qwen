import { Helmet } from 'react-helmet-async'
import styles from './WarrantyPage.module.css'

function WarrantyPage() {
  return (
    <>
      <Helmet>
        <title>Гарантия и возврат - Разбор Выкуп</title>
        <meta name="description" content="Условия гарантии и возврата автозапчастей. Правила обмена и возврата товара." />
      </Helmet>

      <div className={styles.warrantyPage}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Гарантия и возврат</h1>

          <div className={styles.content}>
            <p className={styles.introText}>
              Дорогие клиенты, настоятельно просим вас ознакомиться с правилами обмена и возврата.
            </p>

            <div className={styles.warrantySection}>
              <h2 className={styles.sectionTitle}>Запчасти на которые распространяется гарантия</h2>
              <ul className={styles.warrantyList}>
                <li>
                  <span className={styles.warrantyTerm}>Элетрооборудование, кузовные части (детали)</span>
                  <span className={styles.warrantyDays}>гарантии нет!</span>
                </li>
                <li>
                  <span className={styles.warrantyTerm}>Двигателя и трансмиссия</span>
                  <span className={styles.warrantyDays}>14 дней на установку и проверку (с момента получения)</span>
                </li>
                <li>
                  <span className={styles.warrantyTerm}>Узлы и агрегаты навесного оборудования</span>
                  <span className={styles.warrantyDays}>3 дня на установку</span>
                </li>
              </ul>
            </div>

            <div className={styles.noReturnSection}>
              <h2 className={styles.sectionTitle}>Запчасти не подлежащие к возврату</h2>
              <ul className={styles.noReturnList}>
                <li>Отрезные элементы кузова (крыша, лонжероны, задние крылья, пороги и т.д.)</li>
                <li>Детали уценённые (с дефектами), ремкомплекты продаются как набор запасных частей для ремонта - возврату и обмену не подлежат</li>
                <li>Детали, доставляемые перевозчиком (Транспортной Компанией) поврежденные в процессе перевозки (доставки)</li>
                <li>Исправные детали не подошедшие клиенту</li>
              </ul>
            </div>

            <div className={styles.attentionSection}>
              <h2 className={styles.sectionTitle}>⚠️ Внимание</h2>
              <ul className={styles.attentionList}>
                <li>Товар к возврату не принимается если были изменения ПО детали, так же товар не принимается в случае его самовольного вскрытия покупателем и нарушения пломб.</li>
                <li>За отказ от обрешётки, Клиент принимает на себя все риски повреждения груза.</li>
                <li>Покупатель берет на себя ответственность по оплате за ремонт, монтаж, демонтаж, транспортировку без возврата денежных средств при обмене и возврате данного товара.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default WarrantyPage