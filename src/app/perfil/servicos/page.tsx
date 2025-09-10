"use client";
import {
  Clock,
  Edit,
  Mail,
  Phone,
  Plus,
  Settings,
  SidebarOpen,
  Trash2,
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
import { Admin } from "../agendamentos/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

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
}

export default function ServicesPage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    duration_minutes: "",
    price: "",
    category: "",
    professionalIds: [] as string[],
  });
  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      duration_minutes: "",
      price: "",
      category: "",
      professionalIds: [],
    });
  };

  useEffect(() => {
    handleSession();
  }, []);

  const handleSession = async () => {
    setIsLoading(true);
    try {
      const { data: sessionUser } = await supabase.auth.getSession();
      const sessionToken = sessionUser.session?.access_token;

      const response = await fetch("/api/auth/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(response.status);
        console.log(response.statusText);
        setIsLoading(false);
        setTypeAlert("error");
        setShowAlert(!showAlert);
        setIsAlert(
          "Não foi possível encontrar usuário. Redirecionando para o login."
        );
        setTimeout(
          () => (window.location.href = "/signin?redirect=/perfil"),
          1000
        );
        return;
      }

      setUserProfile(data.profile);
      setIsLoading(false);
      setTypeAlert("success");
      setIsAlert("Usuário encontrado com sucesso. Dados carregados.");
      setShowAlert(!showAlert);
    } catch (error) {
      console.error("Não foi possível encontrar sessão ativa", error);
      setIsLoading(false);
      setTypeAlert("error");
      setIsAlert(
        "Não foi possível encontrar sessão ativa. Redirecionando para o login."
      );
      setShowAlert(!showAlert);
      setTimeout(
        () => (window.location.href = "/signin?redirect=/perfil"),
        1000
      );
      return;
    }
  };

  useEffect(() => {
    fetchAdmin();
    fetchProfessionals();
    fetchAllServices();
  }, [userProfile]);

  const fetchAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/perfil/app/admin/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: userProfile.slug_link }),
      });

      if (!response.ok) {
        setTypeAlert("error");
        setIsAlert(
          "Não foi possível localizar admin da conta. Recarregue a página."
        );
        setShowAlert(!showAlert);
        return;
      }

      const data = await response.json();

      if (data.user_admin) {
        setCurrentAdmin(data.user_admin);
        fetchServices(data.user_admin);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Não foi possível localizar admin da conta:", error);
      setTypeAlert("error");
      setIsAlert(
        "Não foi possível localizar admin da conta. Recarregue a página."
      );
      setShowAlert(!showAlert);
      setIsLoading(false);
      return;
    }
  };

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

  const fetchServices = async (admin: Admin) => {
    try {
      const slugAdmin = admin.slug_link;
      /*
      let url = "/api/services";
      if (admin.role === "super_admin" && admin.slug_link) {
        url += `?professional_id=${admin.slug_link}`;
      }*/
      //const res = await fetch(url);

      const response = await fetch(
        "/api/auth/perfil/app/services/fetch-services",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slugAdmin }),
        }
      );

      if (!response.ok) {
        setTypeAlert("error");
        setIsAlert("Não foi possível encontrar serviços do usuário.");
        setShowAlert(!showAlert);
        return;
      }

      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      setTypeAlert("error");
      setIsAlert("Não foi possível encontrar serviços do usuário.");
      setShowAlert(!showAlert);
      return;
    }
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

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/perfil/app/services/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug_link: userProfile.slug_link,
          name: serviceForm.name,
          duration_minutes: serviceForm.duration_minutes,
          price: serviceForm.price || null,
          category: serviceForm.category,
          professionalIds: serviceForm.professionalIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao criar serviço");
        return;
      }

      alert("Serviço criado com sucesso!");
      setIsCreateServiceOpen(false);
      resetServiceForm();
      fetchServices(currentAdmin!);
      fetchAllServices();
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      alert("Erro ao criar serviço.");
    } finally {
      setLoading(false);
    }
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      duration_minutes: service.duration_minutes.toString(),
      price: service.price?.toString() || "",
      category: service.category,
      professionalIds:
        service.professional_services?.map((ps) => ps.professional.id) || [],
    });
    setIsEditServiceOpen(true);
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/perfil/app/services/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug_link: userProfile.slug_link,
          id: editingService.id,
          name: serviceForm.name,
          duration_minutes: serviceForm.duration_minutes,
          price: serviceForm.price || null,
          category: serviceForm.category,
          professionalIds: serviceForm.professionalIds,
          adminRole: currentAdmin?.role,
          adminProfessionalId: currentAdmin?.professional_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao atualizar serviço");
        return;
      }

      alert("Serviço atualizado com sucesso!");
      setIsEditServiceOpen(false);
      resetServiceForm();
      setEditingService(null);
      fetchServices(currentAdmin!);
      fetchAllServices();
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      alert("Erro ao atualizar serviço.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const res = await fetch(`/api/auth/perfil/app/services?id=${serviceId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao excluir serviço");
        return;
      }

      alert("Serviço excluído com sucesso!");
      fetchServices(currentAdmin!);
      fetchAllServices();
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      alert("Erro ao excluir serviço.");
    }
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
                Serviços ({services.length})
                {currentAdmin?.role === "admin" && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    - Seus serviços
                  </span>
                )}
              </CardTitle>
              {currentAdmin?.role === "super_admin" && (
                <Dialog
                  open={isCreateServiceOpen}
                  onOpenChange={setIsCreateServiceOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-main-purple hover:bg-main-pink text-white flex justify-center items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Serviço</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateService} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="serviceName">Nome *</label>
                          <Input
                            id="serviceName"
                            value={serviceForm.name}
                            onChange={(e) =>
                              setServiceForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Nome do serviço"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="serviceDuration">
                            Duração (minutos) *
                          </label>
                          <Input
                            id="serviceDuration"
                            type="number"
                            value={serviceForm.duration_minutes}
                            onChange={(e) =>
                              setServiceForm((prev) => ({
                                ...prev,
                                duration_minutes: e.target.value,
                              }))
                            }
                            placeholder="30"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="servicePrice">Preço (R$)</label>
                          <Input
                            id="servicePrice"
                            type="number"
                            step="0.01"
                            value={serviceForm.price}
                            onChange={(e) =>
                              setServiceForm((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            placeholder="25.00"
                          />
                        </div>
                        <div>
                          <label htmlFor="serviceCategory">Categoria</label>
                          <Select
                            value={serviceForm.category}
                            onValueChange={(value) =>
                              setServiceForm((prev) => ({
                                ...prev,
                                category: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-sub-background">
                              <SelectItem
                                value="in-person"
                                className="hover:bg-gray-300 cursor-pointer"
                              >
                                Presencial
                              </SelectItem>
                              <SelectItem
                                value="call"
                                className="hover:bg-gray-300 cursor-pointer"
                              >
                                Ligação
                              </SelectItem>
                              <SelectItem
                                value="msg"
                                className="hover:bg-gray-300 cursor-pointer"
                              >
                                Mensagem
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label>Profissionais</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                          {professionals.map((professional) => (
                            <div
                              key={professional.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`professional-${professional.id}`}
                                checked={serviceForm.professionalIds.includes(
                                  professional.id
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setServiceForm((prev) => ({
                                      ...prev,
                                      professionalIds: [
                                        ...prev.professionalIds,
                                        professional.id,
                                      ],
                                    }));
                                  } else {
                                    setServiceForm((prev) => ({
                                      ...prev,
                                      professionalIds:
                                        prev.professionalIds.filter(
                                          (id) => id !== professional.id
                                        ),
                                    }));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`professional-${professional.id}`}
                                className="text-sm"
                              >
                                {professional.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setIsCreateServiceOpen(false);
                            resetServiceForm();
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
                          {loading ? "Criando..." : "Criar Serviço"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
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
                        Duração
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Preço
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Categoria
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Profissionais
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr
                        key={service.id}
                        className="border-b border-gray-100 hover:bg-gray-200"
                      >
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {service.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration_minutes}min
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="flex items-center">
                            {service.price
                              ? `R$ ${service.price.toFixed(2)}`
                              : "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <Badge variant="outline">{service.category}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {service.professional_services?.length || 0}{" "}
                          profissionais
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditService(service)}
                              className="px-4 py-2 bg-gray-100 border border-gray-300 font-bold rounded hover:bg-gray-300 transition cursor-pointer text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {currentAdmin?.role === "super_admin" && (
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                className="px-4 py-2 bg-gray-100 border border-gray-300 font-bold rounded hover:bg-gray-300 transition cursor-pointer text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {services.length === 0 && (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum serviço encontrado.</p>
                </div>
              )}
            </CardContent>

            {/* Edit Service Dialog */}
            <Dialog
              open={isEditServiceOpen}
              onOpenChange={setIsEditServiceOpen}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Serviço</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditService} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editServiceName">Nome *</label>
                      <Input
                        id="editServiceName"
                        value={serviceForm.name}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Nome do serviço"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="editServiceDuration">
                        Duração (minutos) *
                      </label>
                      <Input
                        id="editServiceDuration"
                        type="number"
                        value={serviceForm.duration_minutes}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            duration_minutes: e.target.value,
                          }))
                        }
                        placeholder="30"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editServicePrice">Preço (R$)</label>
                      <Input
                        id="editServicePrice"
                        type="number"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="25.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="editServiceCategory">Categoria</label>
                      <Select
                        value={serviceForm.category}
                        onValueChange={(value) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-sub-background">
                          <SelectItem
                            value="in-person"
                            className="hover:bg-gray-300 cursor-pointer"
                          >
                            Presencial
                          </SelectItem>
                          <SelectItem
                            value="msg"
                            className="hover:bg-gray-300 cursor-pointer"
                          >
                            Mensagem
                          </SelectItem>
                          <SelectItem
                            value="call"
                            className="hover:bg-gray-300 cursor-pointer"
                          >
                            Ligação
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {currentAdmin?.role === "super_admin" && (
                    <div>
                      <label>Profissionais</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                        {professionals.map((professional) => (
                          <div
                            key={professional.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`edit-professional-${professional.id}`}
                              checked={serviceForm.professionalIds.includes(
                                professional.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setServiceForm((prev) => ({
                                    ...prev,
                                    professionalIds: [
                                      ...prev.professionalIds,
                                      professional.id,
                                    ],
                                  }));
                                } else {
                                  setServiceForm((prev) => ({
                                    ...prev,
                                    professionalIds:
                                      prev.professionalIds.filter(
                                        (id) => id !== professional.id
                                      ),
                                  }));
                                }
                              }}
                            />
                            <label
                              htmlFor={`edit-professional-${professional.id}`}
                              className="text-sm"
                            >
                              {professional.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditServiceOpen(false);
                        resetServiceForm();
                        setEditingService(null);
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
