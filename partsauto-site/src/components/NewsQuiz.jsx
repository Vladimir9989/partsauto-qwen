import { useState } from 'react'
import styles from './NewsQuiz.module.css'

function getResultText(score, total) {
  const ratio = score / total
  if (ratio === 1) return 'Идеальный результат! Вы разбираетесь в теме на уровне эксперта.'
  if (ratio >= 0.5) return 'Неплохо! Основные факты вы уловили.'
  return 'Есть куда расти — перечитайте статью и попробуйте ещё раз.'
}

function NewsQuiz({ title = 'Проверьте себя', questions }) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!Array.isArray(questions) || questions.length === 0) return null

  const total = questions.length
  const current = questions[step]
  const isCorrect = selected !== null && selected === current.correctIndex

  const handleSelect = (optionIndex) => {
    if (selected !== null) return
    setSelected(optionIndex)
    if (optionIndex === current.correctIndex) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (step + 1 < total) {
      setStep((s) => s + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  const handleRestart = () => {
    setStep(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  return (
    <div className={styles.quiz}>
      <h2 className={styles.quizTitle}>{title}</h2>

      {!finished ? (
        <>
          <div className={styles.progress}>Вопрос {step + 1} из {total}</div>
          <p className={styles.question}>{current.question}</p>

          <div className={styles.options}>
            {current.options.map((option, index) => {
              let className = styles.option
              if (selected !== null) {
                if (index === current.correctIndex) {
                  className = `${styles.option} ${styles.optionCorrect}`
                } else if (index === selected) {
                  className = `${styles.option} ${styles.optionWrong}`
                } else {
                  className = `${styles.option} ${styles.optionDisabled}`
                }
              }
              return (
                <button
                  key={index}
                  type="button"
                  className={className}
                  onClick={() => handleSelect(index)}
                  disabled={selected !== null}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {selected !== null && (
            <button type="button" className={styles.nextButton} onClick={handleNext}>
              {step + 1 < total ? 'Далее' : 'Показать результат'}
            </button>
          )}
        </>
      ) : (
        <div className={styles.result}>
          <div className={styles.resultScore}>{score} из {total}</div>
          <p className={styles.resultText}>{getResultText(score, total)}</p>
          <button type="button" className={styles.nextButton} onClick={handleRestart}>
            Пройти ещё раз
          </button>
        </div>
      )}
    </div>
  )
}

export default NewsQuiz
