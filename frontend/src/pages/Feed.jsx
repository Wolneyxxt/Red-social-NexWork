import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import './Feed.css'

const SKILLS_ALTA = ['React', 'Python', 'AWS', 'Machine Learning', 'Docker']

function RecruiterBadge({ company, role }) {
  return (
    <span className="recruiter-badge">
      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
      {role || 'Recrutador'}{company ? ` · ${company}` : ''}
    </span>
  )
}

function PostCard({ post, currentUser, onDelete }) {
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(post.comments || [])
  const [likes, setLikes] = useState(post.likes || [])
  const [loadingLike, setLoadingLike] = useState(false)
  const [loadingComment, setLoadingComment] = useState(false)
  const [modal, setModal] = useState({ open: false, type: '', targetId: null, loading: false })

  const isOwner = post.author_id === currentUser?.id || post.author?.id === currentUser?.id
  const isLiked = likes.some(l => l.user_id === currentUser?.id)

  const handleLike = async () => {
    if (loadingLike) return
    setLoadingLike(true)
    const wasLiked = likes.some(l => l.user_id === currentUser?.id)
    setLikes(prev => wasLiked
      ? prev.filter(l => l.user_id !== currentUser?.id)
      : [...prev, { user_id: currentUser?.id }]
    )
    try { await api.put(`/posts/${post.id}/like`) }
    catch {
      setLikes(prev => wasLiked
        ? [...prev, { user_id: currentUser?.id }]
        : prev.filter(l => l.user_id !== currentUser?.id)
      )
    } finally { setLoadingLike(false) }
  }

  const handleComment = async e => {
    e.preventDefault()
    if (!comment.trim() || loadingComment) return
    setLoadingComment(true)
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, { text: comment })
      const userFallback = {
        id: currentUser?.id,
        name: currentUser?.name || 'Usuário',
        avatar: currentUser?.avatar,
        account_type: currentUser?.account_type,
        recruiter_company: currentUser?.recruiter_company || currentUser?.company || '',
        company: currentUser?.recruiter_company || currentUser?.company || '',
      }
      const newComment = {
        ...data,
        user: (data.user && data.user.name) ? data.user : userFallback
      }
      setComments(prev => [...prev, newComment])
      setComment('')
    } catch {} finally { setLoadingComment(false) }
  }

  const confirmDelete = (type, id) => setModal({ open: true, type, targetId: id, loading: false })

  const handleConfirm = async () => {
    setModal(m => ({ ...m, loading: true }))
    try {
      if (modal.type === 'post') {
        await api.delete(`/posts/${post.id}`)
        onDelete(post.id)
      } else {
        await api.delete(`/posts/${post.id}/comments/${modal.targetId}`)
        setComments(prev => prev.filter(c => c.id !== modal.targetId))
      }
      setModal({ open: false, type: '', targetId: null, loading: false })
    } catch { setModal(m => ({ ...m, loading: false })) }
  }

  return (
    <div className="post-card card">
      <ConfirmModal
        open={modal.open} danger
        title={modal.type === 'post' ? 'Deletar post?' : 'Deletar comentário?'}
        message={modal.type === 'post'
          ? 'Esta ação não pode ser desfeita. O post será removido permanentemente.'
          : 'Tem certeza que deseja remover este comentário?'
        }
        loading={modal.loading}
        onConfirm={handleConfirm}
        onCancel={() => setModal({ open: false, type: '', targetId: null, loading: false })}
      />

      <div className="post-header">
        <img
          className="post-avatar"
          src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`}
          alt={post.author?.name}
        />
        <div className="post-meta">
          <div className="post-author-row">
            <span className="post-author">{post.author?.name}</span>
            {post.author?.account_type === 'recruiter' && (
              <RecruiterBadge company={post.author?.recruiter_company || post.author?.company} role={post.author?.role} />
            )}
          </div>
          <div className="post-role">
            {post.author?.role && <span>{post.author.role}</span>}
            {post.author?.role && post.author?.company && <span>·</span>}
            {post.author?.company && <span>{post.author.company}</span>}
            <span className="post-time">· {timeAgo(post.created_at)}</span>
          </div>
        </div>
        {isOwner && (
          <button className="post-delete-btn" onClick={() => confirmDelete('post', post.id)} title="Deletar post">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        )}
      </div>

      {post.title && <h3 className="post-title">{post.title}</h3>}
      <p className="post-content-text">{post.content}</p>

      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}

      {post.media_type === 'video' && post.video && (
        <div className="post-image">
          <video src={post.video} controls className="post-video" />
        </div>
      )}
      {post.media_type === 'image' && post.image && (
        <div className="post-image"><img src={post.image} alt="post" /></div>
      )}
      {!post.media_type && post.image && (
        <div className="post-image"><img src={post.image} alt="post" /></div>
      )}

      <div className="post-stats">
        <span>{likes.length} curtida{likes.length !== 1 ? 's' : ''}</span>
        <span className="post-stats-comments" onClick={() => setShowComments(v => !v)}>
          {comments.length} comentário{comments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="post-actions">
        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike} disabled={loadingLike}>
          <svg width="16" height="16" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Curtir
        </button>
        <button className="action-btn" onClick={() => setShowComments(v => !v)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Comentar
        </button>
        <button className="action-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Compartilhar
        </button>
        <button className="action-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Salvar
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.length > 0 && (
            <div className="comments-list">
              {comments.map((c, i) => {
                const isMyComment = c.user_id === currentUser?.id || c.user?.id === currentUser?.id
                const resolvedUser = isMyComment
                  ? { ...currentUser, ...(c.user?.name ? c.user : {}) }
                  : c.user
                const isRecruiterComment = resolvedUser?.account_type === 'recruiter'
                const commentName = resolvedUser?.name || 'Usuário'
                const commentAvatar = resolvedUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${commentName}`
                const recruiterCompany = resolvedUser?.recruiter_company || resolvedUser?.company || ''

                return (
                  <div key={c.id || i} className={`comment-item ${isRecruiterComment ? 'recruiter-comment' : ''}`}>
                    <img src={commentAvatar} alt="" className="comment-avatar" />
                    <div className="comment-bubble">
                      <div className="comment-header">
                        <div className="comment-author-info">
                          <strong>{commentName}</strong>
                          {isRecruiterComment && (
                            <RecruiterBadge company={recruiterCompany} role={resolvedUser?.role} />
                          )}
                        </div>
                        {isMyComment && (
                          <button className="comment-delete-btn" onClick={() => confirmDelete('comment', c.id)} title="Deletar comentário">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <p>{c.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <form className="comment-form" onSubmit={handleComment}>
            <img
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
              alt=""
              className="comment-avatar"
            />
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Escreva um comentário..."
              disabled={loadingComment}
            />
            <button type="submit" className="btn-primary comment-send" disabled={loadingComment || !comment.trim()}>
              {loadingComment
                ? <span className="btn-spinner" />
                : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
              }
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function timeAgo(date) {
  if (!date) return ''
  const utcDate = date.endsWith('Z') ? date : date + 'Z'
  const diff = Date.now() - new Date(utcDate).getTime()
  if (diff < 0) return 'agora'
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'agora'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d atrás`
  const weeks = Math.floor(d / 7)
  if (weeks < 4) return `${weeks}sem atrás`
  const months = Math.floor(d / 30)
  if (months < 12) return `${months}mes atrás`
  return `${Math.floor(months / 12)}ano atrás`
}

export default function Feed() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [suggested, setSuggested] = useState([])
  const [following, setFollowing] = useState([])
  const [mediaFile, setMediaFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [expanded, setExpanded] = useState(false)
  const fileInputRef = useRef(null)
  const intervalRef = useRef(null)
  const isRecruiter = user?.account_type === 'recruiter'

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts')
      setPosts(data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    fetchPosts()
    api.get('/users').then(r => setSuggested(r.data.slice(0, 3))).catch(() => {})
    api.get('/users/me/following').then(r => setFollowing(r.data)).catch(() => {})
    intervalRef.current = setInterval(fetchPosts, 15000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const toggleFollow = async (id) => {
    const isFollowing = following.includes(id)
    try {
      if (isFollowing) {
        await api.delete(`/users/follow/${id}`)
        setFollowing(f => f.filter(x => x !== id))
      } else {
        await api.post(`/users/follow/${id}`)
        setFollowing(f => [...f, id])
      }
    } catch (e) {
      console.error('Erro ao seguir', e)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) return
    setUploading(true)
    setUploadProgress(isVideo ? 'Enviando vídeo...' : 'Enviando imagem...')
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1]
        const { data } = await api.post('/upload', { base64, fileName: file.name, mimeType: file.type })
        setMediaFile({ url: data.url, type: data.type, preview: ev.target.result })
        setUploadProgress('')
      }
      reader.readAsDataURL(file)
    } catch {
      setUploadProgress('Erro no upload. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setUploadProgress('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const createPost = async e => {
    e.preventDefault()
    if ((!content.trim() && !mediaFile) || posting) return
    setPosting(true)
    try {
      const payload = { content }
      if (mediaFile?.type === 'image') { payload.image = mediaFile.url; payload.media_type = 'image' }
      else if (mediaFile?.type === 'video') { payload.video = mediaFile.url; payload.media_type = 'video' }
      await api.post('/posts', payload)
      setContent('')
      setMediaFile(null)
      setExpanded(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchPosts()
    } catch {} finally { setPosting(false) }
  }

  const deletePost = id => setPosts(prev => prev.filter(p => p.id !== id))

  return (
    <div className="feed-layout">
      <aside className="feed-sidebar-left">
        <div className="profile-card card">
          <div className="profile-banner" />
          <div className="profile-info">
            <img
              className="profile-avatar"
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
            />
            <h3>{user?.name}</h3>
            {isRecruiter && (
              <span className="profile-recruiter-badge">🏢 {user?.role || 'Recrutador'}</span>
            )}
            <p className="profile-role">{user?.role || (isRecruiter ? 'Recrutador' : 'Profissional de Tecnologia')}</p>
            <p className="profile-company">{user?.recruiter_company || user?.company || ''}</p>
            <div className="profile-stats">
              <div><span>Posts</span><strong>{posts.filter(p => p.author_id === user?.id).length}</strong></div>
              <div><span>Conexões</span><strong>{following.length}</strong></div>
            </div>
          </div>
        </div>

        {isRecruiter && (
          <button className="btn-primary recruiter-publish-btn" onClick={() => navigate("/vagas")}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Publicar Vaga
          </button>
        )}
      </aside>

      <main className="feed-main">
        {!isRecruiter && (
          <form className="create-post card create-post-full" onSubmit={createPost}>
            <div className="create-post-top">
              <img
                className="create-avatar"
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt=""
              />
              <textarea
                className="create-input create-textarea"
                placeholder="Compartilhe um projeto, certificado ou artigo técnico..."
                value={content}
                onChange={e => { setContent(e.target.value); if (!expanded) setExpanded(true) }}
                onFocus={() => setExpanded(true)}
                rows={expanded ? 3 : 1}
              />
            </div>

            {mediaFile && (
              <div className="media-preview">
                {mediaFile.type === 'image'
                  ? <img src={mediaFile.preview} alt="preview" />
                  : <video src={mediaFile.preview} controls />
                }
                <button type="button" className="media-remove-btn" onClick={removeMedia}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {uploadProgress && <p className="upload-progress">{uploadProgress}</p>}

            {expanded && (
              <div className="create-post-actions">
                <div className="create-post-media-btns">
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }} onChange={handleFileSelect} id="img-upload" />
                  <label htmlFor="img-upload" className="media-btn" title="Adicionar imagem">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Imagem
                  </label>
                  <input type="file" accept="video/mp4,video/webm,video/mov"
                    style={{ display: 'none' }} onChange={handleFileSelect} id="vid-upload" />
                  <label htmlFor="vid-upload" className="media-btn" title="Adicionar vídeo">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    Vídeo
                  </label>
                </div>
                <button type="submit" className="btn-primary create-publish-btn"
                  disabled={posting || uploading || (!content.trim() && !mediaFile)}>
                  {posting ? <span className="btn-spinner" /> : 'Publicar'}
                </button>
              </div>
            )}
          </form>
        )}

        {loading ? (
          <div className="feed-loading card">
            <span className="feed-spinner" />
            <p>Carregando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty card">
            <p>Nenhum post ainda. Seja o primeiro a compartilhar!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={user} onDelete={deletePost} />
          ))
        )}
      </main>

      <aside className="feed-sidebar-right">
        <div className="skills-card card">
          <h4>Skills em Alta</h4>
          <ul className="skills-list">
            {SKILLS_ALTA.map((s, i) => (
              <li key={s}><span>{s}</span><span className="skill-rank">#{i + 1}</span></li>
            ))}
          </ul>
        </div>
        <div className="suggested-card card">
          <h4>Profissionais Sugeridos</h4>
          {suggested.length === 0 ? (
            <p style={{fontSize:13, color:'var(--text-muted)'}}>Convide pessoas para a plataforma!</p>
          ) : (
            <ul className="suggested-list">
              {suggested.map(p => (
                <li key={p.id}>
                  <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt={p.name} />
                  <div>
                    <strong>{p.name}</strong>
                    <span>{p.role || (p.account_type === 'recruiter' ? 'Recrutador' : 'Profissional')}</span>
                  </div>
                  <button
                    className={following.includes(p.id) ? 'btn-outline conectado' : 'btn-primary'}
                    style={{padding:'5px 14px', fontSize:12}}
                    onClick={() => toggleFollow(p.id)}
                  >
                    {following.includes(p.id) ? 'Seguindo ✓' : '+ Seguir'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
