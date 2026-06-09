const { createClient } = require("@supabase/supabase-js");

// Cliente com anon key (para autenticação)
const supabase = require("../config/supabase");

// Cliente com service_role key (para inserções que bypassam RLS)
const getAdminClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.register = async (req, res) => {
  const { name, email, password, account_type, recruiter_company } = req.body;

  if (!account_type || !["user", "recruiter"].includes(account_type)) {
    return res
      .status(400)
      .json({ msg: 'Tipo de conta inválido. Use "user" ou "recruiter".' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ msg: error.message });

    if (!data.user) {
      return res.status(400).json({
        msg: "Erro ao criar usuário. Verifique se o email já está em uso.",
      });
    }

    // Usa admin client para garantir inserção mesmo com RLS ativo
    const adminClient = getAdminClient();
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: data.user.id,
      name,
      account_type,
      recruiter_company:
        account_type === "recruiter" ? recruiter_company || "" : "",
      company: account_type === "recruiter" ? recruiter_company || "" : "",
    });

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError.message);
      // Tenta fazer upsert caso o perfil já exista (ex: usuário que confirmou email antes)
      const { error: upsertError } = await adminClient.from("profiles").upsert({
        id: data.user.id,
        name,
        account_type,
        recruiter_company:
          account_type === "recruiter" ? recruiter_company || "" : "",
        company: account_type === "recruiter" ? recruiter_company || "" : "",
      });
      if (upsertError) {
        console.error("Erro no upsert do perfil:", upsertError.message);
      }
    }

    res.status(201).json({
      token: data.session?.access_token,
      user: {
        id: data.user.id,
        name,
        email,
        account_type,
        recruiter_company:
          account_type === "recruiter" ? recruiter_company || "" : "",
      },
    });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ msg: "Erro no servidor" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      return res.status(400).json({ msg: "Email ou senha incorretos" });

    const adminClient = getAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil no login:", profileError.message);
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...(profile || {}),
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ msg: "Erro no servidor" });
  }
};
