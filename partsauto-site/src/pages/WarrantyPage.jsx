import { Helmet } from 'react-helmet-async'
import styles from './WarrantyPage.module.css'

function WarrantyPage() {
  return (
    <>
      <Helmet>
        <title>Гарантия и возврат - PartsAuto</title>
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
                  <span className={styles.warrantyTerm}>Электрооборудование</span>
                  <span className={styles.warrantyDays}>5 дней</span>
                </li>
                <li>
                  <span className={styles.warrantyTerm}>Агрегаты и детали (за исключением электрооборудования и деталей перечисленных ниже)</span>
                  <span className={styles.warrantyDays}>14 дней</span>
                </li>
              </ul>
            </div>

            <div className={styles.noReturnSection}>
              <h2 className={styles.sectionTitle}>Запчасти не подлежащие к возврату</h2>
              <ul className={styles.noReturnList}>
                <li>Отрезные элементы кузова (крыша, лонжероны, задние крылья, пороги и т.д.)</li>
                <li>Детали уценённые (с дефектами), ремкомплекты продаются как набор запасных частей для ремонта - возврату и обмену не подлежат</li>
                <li>Детали, доставляемые перевозчиком (Транспортной Компанией) без заказанной клиентом обрешетки и поврежденные в процессе перевозки (доставки)</li>
              </ul>
            </div>

            <div className={styles.attentionSection}>
              <h2 className={styles.sectionTitle}>⚠️ Внимание</h2>
              <ul className={styles.attentionList}>
                <li>Товар к возврату не принимается без товарного чека, так же товар не принимается в случае его самовольного вскрытия покупателем и нарушения пломб.</li>
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