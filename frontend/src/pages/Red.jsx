import { useState, useEffect } from "react";
import api from "../services/api";
import "./Rede.css";

export default function Rede() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("sugestoes");
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/users"), api.get("/users/me/following")])
      .then(([usersRes, followingRes]) => {
        setUsers(usersRes.data);
        setFollowing(followingRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = async (id) => {
    const isFollowing = following.includes(id);
    try {
      if (isFollowing) {
        await api.delete(`/users/follow/${id}`);
        setFollowing((f) => f.filter((x) => x !== id));
      } else {
        await api.post(`/users/follow/${id}`);
        setFollowing((f) => [...f, id]);
      }
    } catch (e) {
      console.error("Erro ao seguir/deixar de seguir", e);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()) ||
      u.company?.toLowerCase().includes(search.toLowerCase()),
  );

  const sugestoes = filtered.filter((u) => !following.includes(u.id));
  const seguindo = filtered.filter((u) => following.includes(u.id));

  return (
    <div className="rede-page">
      <div className="rede-stats">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#EEF0FF" }}>
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#5B4FE8"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <strong>{following.length}</strong>
            <span>Seguindo</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#ECFDF5" }}>
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <strong>234</strong>
            <span>Visualizações do Perfil</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: "#FFF7ED" }}>
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <div>
            <strong>12</strong>
            <span>Convites Pendentes</span>
          </div>
        </div>
      </div>

      <div className="rede-search card">
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          placeholder="Buscar por nome, cargo, empresa ou habilidades..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rede-tabs">
        <button
          className={tab === "sugestoes" ? "tab active" : "tab"}
          onClick={() => setTab("sugestoes")}
        >
          Sugestões ({sugestoes.length})
        </button>
        <button
          className={tab === "seguindo" ? "tab active" : "tab"}
          onClick={() => setTab("seguindo")}
        >
          Seguindo ({seguindo.length})
        </button>
      </div>

      {loading ? (
        <div className="rede-empty card">
          <p>Carregando...</p>
        </div>
      ) : (
        <div className="rede-grid">
          {(tab === "sugestoes" ? sugestoes : seguindo).length === 0 ? (
            <div className="rede-empty card">
              <p>
                {tab === "sugestoes"
                  ? "Nenhuma sugestão encontrada."
                  : "Você ainda não segue ninguém."}
              </p>
            </div>
          ) : (
            (tab === "sugestoes" ? sugestoes : seguindo).map((user) => (
              <div key={user.id} className="user-card card">
                <img
                  className="user-avatar"
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                  }
                  alt={user.name}
                />
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p className="user-role">
                    {user.role || "Profissional de Tecnologia"}
                  </p>
                  {user.company && (
                    <p className="user-company">
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      {user.company}
                    </p>
                  )}
                </div>
                <button
                  className={
                    following.includes(user.id)
                      ? "btn-outline conectado"
                      : "btn-primary"
                  }
                  onClick={() => toggleFollow(user.id)}
                >
                  {following.includes(user.id) ? "Seguindo ✓" : "+ Seguir"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
