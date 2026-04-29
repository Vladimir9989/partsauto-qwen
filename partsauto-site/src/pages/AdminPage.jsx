import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import styles from './AdminPage.module.css'

const ADMIN_PASSWORD = 'admin123'

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('cars')
  
  // Состояния для машин
  const [cars, setCars] = useState([])
  const [newCarTitle, setNewCarTitle] = useState('')
  const [newCarDescription, setNewCarDescription] = useState('')
  const [newCarImage, setNewCarImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [carsLoading, setCarsLoading] = useState(false)
  
  // Состояния для редактирования машины
  const [editingCar, setEditingCar] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImage, setEditImage] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  const [editingUploading, setEditingUploading] = useState(false)
  
  // Состояния для новостей
  const [news, setNews] = useState([])
  const [newNewsTitle, setNewNewsTitle] = useState('')
  const [newNewsContent, setNewNewsContent] = useState('')
  const [newsLoading, setNewsLoading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: newNewsContent,
    onUpdate: ({ editor }) => {
      setNewNewsContent(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: styles.tiptapEditor,
      },
    },
  })

  // Функция для загрузки изображений (использует uploadNewsImageToServer)
  const addImage = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()
    
    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return
      
      toast.loading('Загрузка изображения...', { id: 'upload-image' })
      
      try {
        const imageUrl = await uploadNewsImageToServer(file)
        editor?.chain().focus().setImage({ src: imageUrl }).run()
        toast.success('Изображение добавлено', { id: 'upload-image' })
      } catch (error) {
        toast.error('Ошибка загрузки изображения', { id: 'upload-image' })
      }
    }
  }

  // Проверка пароля
  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      toast.success('Вход выполнен')
    } else {
      toast.error('Неверный пароль')
    }
  }

  // Загрузка машин
  const loadCars = async () => {
    setCarsLoading(true)
    try {
      const res = await fetch('/api/cars')
      const data = await res.json()
      if (data.success) setCars(data.data)
    } catch (error) {
      toast.error('Ошибка загрузки машин')
    } finally {
      setCarsLoading(false)
    }
  }

  // Загрузка новостей
  const loadNews = async () => {
    setNewsLoading(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      if (data.success) setNews(data.data)
    } catch (error) {
      toast.error('Ошибка загрузки новостей')
    } finally {
      setNewsLoading(false)
    }
  }

  // Загрузка изображения на сервер (машины)
  const uploadCarImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const res = await fetch('/api/upload-car-image', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.success) return data.imageUrl
    throw new Error(data.error)
  }

  // Загрузка изображений для новостей
  const uploadNewsImageToServer = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const res = await fetch('/api/upload-news-image', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.success) return data.imageUrl
    throw new Error(data.error)
  }


  // Добавление машины
  const addCar = async (e) => {
    e.preventDefault()
    if (!newCarTitle.trim()) {
      toast.error('Введите заголовок')
      return
    }
    
    let imageUrl = null
    if (newCarImage) {
      setUploading(true)
      try {
        imageUrl = await uploadCarImage(newCarImage)
      } catch (error) {
        toast.error('Ошибка загрузки фото: ' + error.message)
        setUploading(false)
        return
      }
      setUploading(false)
    }
    
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newCarTitle, imageUrl, description: newCarDescription })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Машина добавлена')
        setNewCarTitle('')
        setNewCarDescription('')
        setNewCarImage(null)
        const fileInput = document.getElementById('carImageInput')
        if (fileInput) fileInput.value = ''
        loadCars()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Ошибка добавления')
    }
  }

  // Удаление машины
  const deleteCar = async (id) => {
    if (!confirm('Удалить карточку?')) return
    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Удалено')
        loadCars()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Ошибка удаления')
    }
  }

  // Открытие модального окна редактирования
  const openEditModal = (car) => {
    setEditingCar(car)
    setEditTitle(car.title)
    setEditDescription(car.description || '')
    setEditImagePreview(car.imageUrl || '')
    setEditImage(null)
  }

  // Закрытие модального окна редактирования
  const closeEditModal = () => {
    setEditingCar(null)
    setEditTitle('')
    setEditDescription('')
    setEditImage(null)
    setEditImagePreview('')
  }

  // Обработка изменения изображения при редактировании
  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditImage(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setEditImagePreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Сохранение изменений машины
  const saveEditCar = async () => {
    if (!editTitle.trim()) {
      toast.error('Введите заголовок')
      return
    }

    setEditingUploading(true)
    let imageUrl = editImagePreview

    // Если выбрано новое изображение, загружаем его
    if (editImage) {
      try {
        imageUrl = await uploadCarImage(editImage)
      } catch (error) {
        toast.error('Ошибка загрузки фото: ' + error.message)
        setEditingUploading(false)
        return
      }
    }

    try {
      const res = await fetch(`/api/cars/${editingCar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          imageUrl: imageUrl
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Машина обновлена')
        closeEditModal()
        loadCars()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Ошибка сохранения')
    } finally {
      setEditingUploading(false)
    }
  }

  // Добавление новости
  const addNews = async (e) => {
    e.preventDefault()
    if (!newNewsTitle.trim()) {
      toast.error('Введите заголовок')
      return
    }
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newNewsTitle, content: newNewsContent })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Новость добавлена')
        setNewNewsTitle('')
        setNewNewsContent('')
        loadNews()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Ошибка добавления')
    }
  }

  // Удаление новости
  const deleteNews = async (id) => {
    if (!confirm('Удалить новость?')) return
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Удалено')
        loadNews()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Ошибка удаления')
    }
  }

  // Загрузка данных при первой авторизации и при смене вкладки
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'cars') loadCars()
      if (activeTab === 'news') loadNews()
    }
  }, [isAuthenticated, activeTab])

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>Вход в админ-панель</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.passwordInput}
            />
            <button type="submit" className={styles.loginBtn}>Войти</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <h1>Админ-панель</h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'cars' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('cars')}
          >
            Машины в разборе
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'news' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('news')}
          >
            Новости о нас
          </button>
        </div>

        {activeTab === 'cars' && (
          <div className={styles.tabContent}>
            <div className={styles.formCard}>
              <h3>Добавить машину</h3>
              <form onSubmit={addCar}>
                <input
                  type="text"
                  placeholder="Название (марка, модель, год, двигатель)"
                  value={newCarTitle}
                  onChange={(e) => setNewCarTitle(e.target.value)}
                  className={styles.input}
                />
                <textarea
                  placeholder="Описание (будет отображаться только в модальном окне)"
                  value={newCarDescription}
                  onChange={(e) => setNewCarDescription(e.target.value)}
                  className={styles.textarea}
                  rows={4}
                />
                <input
                  id="carImageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCarImage(e.target.files[0])}
                  className={styles.fileInput}
                />
                {uploading && <div className={styles.uploading}>Загрузка фото...</div>}
                <button type="submit" className={styles.submitBtn} disabled={uploading}>
                  {uploading ? 'Загрузка...' : 'Добавить'}
                </button>
              </form>
            </div>

            <div className={styles.listCard}>
              <div className={styles.listHeader}>
                <h3>Список машин</h3>
                <button onClick={loadCars} className={styles.refreshBtn}>Обновить</button>
              </div>
              {carsLoading ? (
                <div className={styles.loader}>Загрузка...</div>
              ) : cars.length === 0 ? (
                <div className={styles.empty}>Нет добавленных машин</div>
              ) : (
                <ul className={styles.list}>
                  {cars.map(car => (
                    <li key={car.id} className={styles.listItem}>
                      <div className={styles.itemContent}>
                        {car.imageUrl && (
                          <img
                            src={car.imageUrl}
                            alt={car.title}
                            className={styles.itemImage}
                          />
                        )}
                        <span className={styles.itemTitle}>{car.title}</span>
                        <span className={styles.itemDate}>{car.date}</span>
                        {car.description && (
                          <div className={styles.itemDescription}>
                            {car.description.length > 100
                              ? car.description.substring(0, 100) + '...'
                              : car.description}
                          </div>
                        )}
                      </div>
                      <div className={styles.itemActions}>
                        <button onClick={() => openEditModal(car)} className={styles.editBtn}>
                          ✏️ Редактировать
                        </button>
                        <button onClick={() => deleteCar(car.id)} className={styles.deleteBtn}>
                          Удалить
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className={styles.tabContent}>
            <div className={styles.formCard}>
              <h3>Добавить новость</h3>
              <form onSubmit={addNews}>
                <input
                  type="text"
                  placeholder="Заголовок новости"
                  value={newNewsTitle}
                  onChange={(e) => setNewNewsTitle(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.editorWrapper}>
                  <div className={styles.toolbar}>
                    <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? styles.activeTool : ''}>B</button>
                    <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? styles.activeTool : ''}>I</button>
                    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? styles.activeTool : ''}>H2</button>
                    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive('heading', { level: 3 }) ? styles.activeTool : ''}>H3</button>
                    <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? styles.activeTool : ''}>• Список</button>
                    <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive('orderedList') ? styles.activeTool : ''}>1. Список</button>
                    <button type="button" onClick={addImage}>📷 Изображение</button>
                  </div>
                  <EditorContent editor={editor} className={styles.tiptapEditor} />
                </div>
                <button type="submit" className={styles.submitBtn}>Добавить</button>
              </form>
            </div>

            <div className={styles.listCard}>
              <div className={styles.listHeader}>
                <h3>Список новостей</h3>
                <button onClick={loadNews} className={styles.refreshBtn}>Обновить</button>
              </div>
              {newsLoading ? (
                <div className={styles.loader}>Загрузка...</div>
              ) : news.length === 0 ? (
                <div className={styles.empty}>Нет добавленных новостей</div>
              ) : (
                <ul className={styles.list}>
                  {news.map(item => (
                    <li key={item.id} className={styles.listItem}>
                      <div className={styles.itemContent}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemDate}>{item.date}</span>
                        {item.content && (
                          <div className={styles.itemPreview}>
                            {item.content.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                      <button onClick={() => deleteNews(item.id)} className={styles.deleteBtn}>
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

       {editingCar && (
         <div className={styles.modalOverlay} onClick={closeEditModal}>
           <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
             <h3>Редактировать машину</h3>
             
             <input
               type="text"
               placeholder="Заголовок"
               value={editTitle}
               onChange={(e) => setEditTitle(e.target.value)}
               className={styles.input}
             />
             
             <textarea
               placeholder="Описание"
               value={editDescription}
               onChange={(e) => setEditDescription(e.target.value)}
               className={styles.textarea}
               rows={4}
             />
             
             {editImagePreview && (
               <img src={editImagePreview} alt="Превью" className={styles.editImagePreview} />
             )}
             
             <input
               type="file"
               accept="image/*"
               onChange={handleEditImageChange}
               className={styles.fileInput}
             />
             
             <div className={styles.modalActions}>
               <button onClick={saveEditCar} disabled={editingUploading} className={styles.submitBtn}>
                 {editingUploading ? 'Сохранение...' : 'Сохранить'}
               </button>
               <button onClick={closeEditModal} className={styles.cancelBtn}>Отмена</button>
             </div>
           </div>
         </div>
       )}
      </div>
    </div>
  )
}

export default AdminPage