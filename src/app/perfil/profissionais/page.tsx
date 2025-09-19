"use client";
import {
  CheckCheck,
  Edit,
  Mail,
  Phone,
  Plus,
  SidebarOpen,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Header } from "../../../../components/header";
import { Footer } from "../../../../components/footer";
import { NavigationProfile } from "../../../../components/profile/navigation-profile";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { supabase } from "../../../../lib/supabase";
import { UserProfile } from "@/app/api/auth/perfil/route";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Badge } from "../../../../components/ui/badge";
import { Banner } from "../../../../components/banner-alert";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

interface Professional {
  slug_link: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  active: boolean;
  professional_services?: {
    service: {
      id: string;
      name: string;
    };
  }[];
  photo_professional: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  category: string;
  active: boolean;
  professional_services?: {
    professional: {
      id: string;
      name: string;
    };
  }[];
}

export default function ProfessionalsPage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [typeAlert, setTypeAlert] = useState<"error" | "success">("error");
  const [isAlert, setIsAlert] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    user_id: "",
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    created_at: "",
    updated_at: "",
    link_app: "",
    link_share_app: "",
    slug_link: "",
    birthdate: "",
    edit_slug: 0,
  });
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isCreateProfessionalOpen, setIsCreateProfessionalOpen] =
    useState(false);
  const [isEditProfessionalOpen, setIsEditProfessionalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [professionalForm, setProfessionalForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceIds: [] as string[],
    photo_professional: "",
  });

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.replace("/signin?redirect=/perfil");
        } else {
          handleSession(session);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (session: Session) => {
    setIsLoading(true);
    try {
      const sessionToken = session.access_token;

      // Se não tiver sessão, já redireciona sem nem chamar a API
      if (!sessionToken) {
        setIsLoading(false);
        router.push("/signin");
        return;
      }

      const response = await fetch("/api/auth/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setShowAlert(true);
        setIsAlert(
          "Não foi possível encontrar usuário. Redirecionando para o login."
        );
        setTimeout(() => router.push("/signin"), 1000);
        return;
      }

      setUserProfile(data.profile);
      setIsLoading(false);
      setTypeAlert("success");
      setShowAlert(true);
      setIsAlert("Usuário encontrado com sucesso. Dados carregados.");
    } catch (error) {
      console.error("Não foi possível encontrar sessão ativa", error);
      setIsLoading(false);
      setTimeout(() => router.push("/signin"), 3000);
      return;
    }
  };

  useEffect(() => {
    if (!userProfile.user_id || !userProfile.slug_link) return;

    checkStatusApp();
  }, [userProfile.user_id, userProfile.slug_link]);

  const checkStatusApp = async () => {
    setIsLoading(false);
    if (!userProfile.user_id || !userProfile.slug_link) return;
    try {
      const response = await fetch("/api/auth/perfil/app/status/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.user_id,
          slugUser: userProfile.slug_link,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        window.location.href = "/perfil?status_plan=plan_disabled";
        return;
      }

      setIsLoading(false);
      setTypeAlert("success");
      setIsAlert(data.message);
      setShowAlert(!showAlert);
    } catch (error) {
      console.error("Não foi possível verificar status do plano:", error);
      setIsLoading(false);
      setTypeAlert("error");
      setIsAlert(
        "Não foi possível encontrar plano ativo, erro do servidor. Redirecionando para ínicio do perfil."
      );
      setShowAlert(!showAlert);
      setTimeout(() => (window.location.href = "/perfil"), 5000);
      return;
    }
  };

  useEffect(() => {
    fetchProfessionals();
    fetchAllServices();
  }, [userProfile]);

  const fetchProfessionals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/auth/perfil/app/professionals/fetch-professionals",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: userProfile.slug_link }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setTypeAlert("error");
        setIsAlert("Não foi possível encontrar profissionais.");
        setShowAlert(!showAlert);
        return;
      }

      setProfessionals(data.professionals || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      setIsLoading(false);
      setTypeAlert("error");
      setIsAlert(
        "Não foi possível encontrar profissionais. Erro interno do servidor"
      );
      setShowAlert(!showAlert);
      return;
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data, error } = await supabase.storage
      .from("photos_professionals")
      .upload(
        `photos/${userProfile.slug_link}/${Date.now()}-${file.name}`,
        file
      );

    if (error) {
      console.error("Erro no upload:", error);
      setTypeAlert("error");
      setIsAlert("Erro ao enviar imagem.");
      setShowAlert(!showAlert);
      return;
    }

    const publicUrl = supabase.storage
      .from("photos_professionals")
      .getPublicUrl(data.path).data.publicUrl;

    setProfessionalForm((prev) => ({
      ...prev,
      photo_professional: publicUrl,
    }));
  };

  const handleCreateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/perfil/app/professionals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug_link: userProfile.slug_link,
          name: professionalForm.name,
          email: professionalForm.email || null,
          phone: professionalForm.phone || null,
          serviceIds: professionalForm.serviceIds,
          photo_professional: professionalForm.photo_professional,
          // specialties: professionalForm.specialties
          //   .split(",")
          //   .map((s) => s.trim())
          //   .filter((s) => s),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTypeAlert("error");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        return;
      }

      setTypeAlert("success");
      setIsAlert(data.message);
      setShowAlert(!showAlert);
      setIsCreateProfessionalOpen(false);
      resetProfessionalForm();
      fetchProfessionals();
    } catch (error) {
      console.error("Erro ao criar profissional:", error);
      setTypeAlert("error");
      setIsAlert("Erro ao criar profissional, erro interno do servidor");
      setShowAlert(!showAlert);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfessional) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/perfil/app/professionals/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug_link: userProfile.slug_link,
          id: editingProfessional.id,
          name: professionalForm.name,
          email: professionalForm.email || null,
          phone: professionalForm.phone || null,
          // specialties: professionalForm.specialties
          //   .split(",")
          //   .map((s) => s.trim())
          //   .filter((s) => s),
          serviceIds: professionalForm.serviceIds,
          photo_professional: professionalForm.photo_professional,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao atualizar profissional");
        return;
      }

      alert("Profissional atualizado com sucesso!");
      setIsEditProfessionalOpen(false);
      resetProfessionalForm();
      setEditingProfessional(null);
      fetchProfessionals();
    } catch (error) {
      console.error("Erro ao atualizar profissional:", error);
      alert("Erro ao atualizar profissional.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfessional = async (professionalId: string) => {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return;

    try {
      const response = await fetch(
        `/api/auth/perfil/app/professionals?id=${professionalId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erro ao excluir profissional");
        return;
      }
      if (response.ok) {
        alert("Profissional excluído com sucesso!");
        fetchProfessionals();
      }
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
      alert("Erro ao excluir profissional.");
    }
  };

  const resetProfessionalForm = () => {
    setProfessionalForm({
      name: "",
      email: "",
      phone: "",
      // specialties: "",
      serviceIds: [],
      photo_professional: "",
    });
  };

  const fetchAllServices = async () => {
    try {
      const response = await fetch(
        "/api/auth/perfil/app/services/fetch-all-services",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: userProfile.slug_link }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAllServices(data.services || []);
      }
    } catch (error) {
      console.error("Erro ao carregar todos os serviços:", error);
    }
  };

  const openEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setProfessionalForm({
      name: professional.name,
      email: professional.email || "",
      phone: professional.phone || "",
      // specialties: professional.specialties?.join(", ") || "",
      serviceIds:
        professional.professional_services?.map((ps) => ps.service.id) || [],
      photo_professional: professional.photo_professional,
    });
    setIsEditProfessionalOpen(true);
  };

  useEffect(() => {
    handleHideAlert();
  }, [showAlert]);

  const handleHideAlert = () => {
    if (showAlert) {
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-pink mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seus dados...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Banner
        type={typeAlert}
        show={showAlert}
        hide={() => setShowAlert(false)}
        message={isAlert}
      />
      <Header />
      <main className="w-full min-h-screen flex justify-center items-start pb-20">
        <NavigationProfile open={openMenu} onClose={() => setOpenMenu(false)} />
        <article className="relative w-full lg:w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-24 lg:pt-12 px-6">
          <div
            className="lg:hidden absolute top-4 left-4 flex justify-center items-center p-2 cursor-pointer hover:bg-main-pink hover:text-white rounded-full lg:hidden"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <SidebarOpen className="w-7 h-7"></SidebarOpen>
          </div>
          <Card className="bg-white w-full border-main-pink/40">
            <CardHeader className="flex flex-col gap-6 md:gap-0 md:flex-row items-center justify-between">
              <CardTitle className="text-gray-900">
                Profissionais ({professionals.length})
              </CardTitle>
              <Dialog
                open={isCreateProfessionalOpen}
                onOpenChange={setIsCreateProfessionalOpen}
              >
                <div className="flex justify-center items-center gap-2">
                  <span className="text-sm text-gray-700">Máx: 5</span>
                  <DialogTrigger asChild>
                    <Button className="bg-main-purple hover:bg-main-pink text-white flex justify-center items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Profissional
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Profissional</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleCreateProfessional}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="professionalName">Nome *</label>
                        <Input
                          id="professionalName"
                          value={professionalForm.name}
                          onChange={(e) =>
                            setProfessionalForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="professionalEmail">Email</label>
                        <Input
                          id="professionalEmail"
                          type="email"
                          value={professionalForm.email}
                          onChange={(e) =>
                            setProfessionalForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="professionalPhone">Telefone</label>
                        <Input
                          id="professionalPhone"
                          value={professionalForm.phone}
                          onChange={(e) =>
                            setProfessionalForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="upload-photo"
                          className="flex flex-col justify-center items-start gap-1 cursor-pointer"
                        >
                          <span>Upload da foto</span>
                          <div className="w-full group bg-white px-2 py-1 flex justify-start items-center gap-2 rounded-lg hover:border-purple-500 hover:ring-1 hover:ring-purple-500">
                            {professionalForm.photo_professional.length > 0 ? (
                              <CheckCheck
                                className={`w-5.5 h-5.5 ${
                                  professionalForm.photo_professional.length > 0
                                    ? "text-green-600 group-hover:text-green-800"
                                    : ""
                                }`}
                              ></CheckCheck>
                            ) : (
                              <>
                                <Upload className="w-5.5 h-5.5 group-hover:text-purple-500"></Upload>
                              </>
                            )}
                            <span
                              className={`text-base ${
                                professionalForm.photo_professional.length > 0
                                  ? "text-green-600 group-hover:text-green-800"
                                  : "group-hover:text-purple-500"
                              }`}
                            >
                              {professionalForm.photo_professional.length > 0
                                ? "Foto Anexada "
                                : "Selecionar uma foto "}
                              <span className="text-sm text-gray-800 font-bold">
                                Máx: 5MB
                              </span>
                            </span>
                          </div>

                          <Input
                            type="file"
                            accept="image/*"
                            id="upload-photo"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label>Serviços</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                        {allServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={professionalForm.serviceIds.includes(
                                service.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setProfessionalForm((prev) => ({
                                    ...prev,
                                    serviceIds: [
                                      ...prev.serviceIds,
                                      service.id,
                                    ],
                                  }));
                                } else {
                                  setProfessionalForm((prev) => ({
                                    ...prev,
                                    serviceIds: prev.serviceIds.filter(
                                      (id) => id !== service.id
                                    ),
                                  }));
                                }
                              }}
                            />
                            <label
                              htmlFor={`service-${service.id}`}
                              className="text-sm"
                            >
                              {service.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setIsCreateProfessionalOpen(false);
                          resetProfessionalForm();
                        }}
                        className="text-white"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-main-purple text-white hover:bg-sub-background hover:text-black"
                        disabled={loading}
                      >
                        {loading ? "Criando..." : "Criar Profissional"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-900">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Telefone
                      </th>
                      {/* <th className="text-left py-3 px-4 text-gray-900">
                        Especialidades
                      </th> */}
                      <th className="text-left py-3 px-4 text-gray-900">
                        Serviços
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.map((professional) => (
                      <tr
                        key={professional.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-3 px-4 text-gray-700">
                          {professional.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="flex items-center">
                            {professional.email && (
                              <Mail className="h-4 w-4 mr-1" />
                            )}
                            {professional.email || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="flex items-center">
                            {professional.phone && (
                              <Phone className="h-4 w-4 mr-1" />
                            )}
                            {professional.phone || "-"}
                          </div>
                        </td>
                        {/* <td className="py-3 px-4 text-gray-700">
                          {professional.specialties?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {professional.specialties.map(
                                (specialty, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs text-white"
                                  >
                                    {specialty}
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td> */}
                        <td className="py-3 px-4 text-gray-700">
                          {professional.professional_services?.length || 0}{" "}
                          serviços
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditProfessional(professional)}
                              className="px-4 py-2 bg-gray-100 border border-gray-300 font-bold rounded hover:bg-gray-300 transition cursor-pointer text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteProfessional(professional.id)
                              }
                              className="px-4 py-2 bg-gray-100 border border-gray-300 font-bold rounded hover:bg-gray-300 transition cursor-pointer text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {professionals.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhum profissional encontrado.
                  </p>
                </div>
              )}
            </CardContent>

            {/* Edit Professional Dialog */}
            <Dialog
              open={isEditProfessionalOpen}
              onOpenChange={setIsEditProfessionalOpen}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Profissional</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditProfessional} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editProfessionalName">Nome *</label>
                      <Input
                        id="editProfessionalName"
                        value={professionalForm.name}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="editProfessionalEmail">Email</label>
                      <Input
                        id="editProfessionalEmail"
                        type="email"
                        value={professionalForm.email}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editProfessionalPhone">Telefone</label>
                      <Input
                        id="editProfessionalPhone"
                        value={professionalForm.phone}
                        onChange={(e) =>
                          setProfessionalForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="upload-photo"
                        className="flex flex-col justify-center items-start gap-1 cursor-pointer"
                      >
                        <span>Upload da foto</span>
                        <div className="w-full group bg-white px-2 py-1 flex justify-start items-center gap-2 rounded-lg hover:border-purple-500 hover:ring-1 hover:ring-purple-500">
                          <Upload className="w-5.5 h-5.5 group-hover:text-purple-500"></Upload>
                          <span className="text-base group-hover:text-purple-500">
                            {professionalForm.photo_professional.length > 0
                              ? "Foto Anexada "
                              : "Selecionar uma foto "}
                            <span className="text-sm text-gray-800 font-bold">
                              Máx: 5MB
                            </span>
                          </span>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          id="upload-photo"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label>Serviços</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                      {allServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`edit-service-${service.id}`}
                            checked={professionalForm.serviceIds.includes(
                              service.id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setProfessionalForm((prev) => ({
                                  ...prev,
                                  serviceIds: [...prev.serviceIds, service.id],
                                }));
                              } else {
                                setProfessionalForm((prev) => ({
                                  ...prev,
                                  serviceIds: prev.serviceIds.filter(
                                    (id) => id !== service.id
                                  ),
                                }));
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-service-${service.id}`}
                            className="text-sm"
                          >
                            {service.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditProfessionalOpen(false);
                        resetProfessionalForm();
                        setEditingProfessional(null);
                      }}
                      className="text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-main-purple hover:bg-sub-background text-white hover:text-black"
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </Card>
        </article>
      </main>
      <Footer />
    </>
  );
}
