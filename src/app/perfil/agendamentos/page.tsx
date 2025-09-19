"use client";
import { Calendar, RefreshCw, SidebarOpen, Trash2 } from "lucide-react";
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
import { supabase } from "../../../../lib/supabase";
import { UserProfile } from "@/app/api/auth/perfil/route";
import { formatDate } from "../../../../lib/plans";
import { Banner } from "../../../../components/banner-alert";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

export type Appointment = {
  id: string;
  slug_link: string;
  created_at: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string;
  service_id: string;
  professional_id: string;
  status: string;
  service?: {
    name: string;
  };
  professional?: {
    name: string;
  };
};

export type Admin = {
  id: string;
  email: string;
  name: string;
  slug_link: string;
  role: "admin" | "super_admin";
  professional_id?: string;
  professional?: {
    name: string;
  };
  created_at: string;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [typeAlert, setTypeAlert] = useState<"error" | "success">("error");
  const [isAlert, setIsAlert] = useState<string>("");
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
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
    cep: "",
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

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

    fetchAdmin();
    fetchAppointments();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "cancelled":
        return "Cancelado";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  const fetchAdmin = async () => {
    console.log("UserProfile Slug:", userProfile.slug_link);
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

  // Busca os appointments
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/perfil/app/appointments/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: userProfile.slug_link }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setIsAlert(
          "Não foi possível encontrar agendamentos no perfil do usuário."
        );
        setShowAlert(!showAlert);
      }

      setAppointments(data.data || []);
      setTypeAlert("success");
      setIsAlert("Agendamentos encontrados com sucesso!");
      setShowAlert(!showAlert);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro interno do servidor:", error);
      setTypeAlert("error");
      setIsAlert(
        "Não foi possível encontrar agendamentos. Recarregue a página."
      );
      setShowAlert(!showAlert);
      setIsLoading(false);
      return;
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      setTypeAlert("success");
      setIsAlert("Agendamentos atualizado com sucesso!");
      setShowAlert(!showAlert);

      // Refresh monthly report if status changed
      // if (currentAdmin) {
      //   fetchMonthlyReport(currentAdmin, selectedMonth);
      // }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setTypeAlert("error");
      setIsAlert("Erro ao atualizar status. Tente novamente.");
      setShowAlert(!showAlert);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

    try {
      const res = await fetch(
        "/api/auth/perfil/app/appointments/admin-delete",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            action: "delete",
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setTypeAlert("error");
        setIsAlert("Erro ao excluir agendamento, tente novamente");
        setShowAlert(!showAlert);
        return;
      }

      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
      setTypeAlert("success");
      setIsAlert("Agendamentos excluido com sucesso!");
      setShowAlert(!showAlert);
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      setTypeAlert("error");
      setIsAlert("Erro ao excluir agendamento, erro interno do servidor.");
      setShowAlert(!showAlert);
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
            <CardHeader className="flex flex-col-reverse gap-6 md:gap-0 md:flex-row items-center justify-between">
              <CardTitle className="text-gray-900">
                Agendamentos ({appointments.length})
                {currentAdmin?.role === "admin" &&
                  currentAdmin.professional && (
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                      - {currentAdmin.professional.name}
                    </span>
                  )}
              </CardTitle>
              <CardContent>
                <div
                  className={`p-1 rounded-full cursor-pointer hover:bg-main-pink text-gray-800 hover:text-white ${
                    isLoading ? "animate-spin" : ""
                  }`}
                  onClick={fetchAppointments}
                >
                  <RefreshCw className="w-6 h-6"></RefreshCw>
                </div>
              </CardContent>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-900">
                        Data
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Horário
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Cliente
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Telefone
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Serviço
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Profissional
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...appointments]
                      .sort((a, b) => {
                        // compara primeiro a data
                        const dateA = new Date(a.appointment_date).getTime();
                        const dateB = new Date(b.appointment_date).getTime();

                        if (dateA !== dateB) return dateA - dateB;

                        // Se a data for igual compara o horário
                        const [hourA, minuteA] = a.appointment_time
                          .split(":")
                          .map(Number);
                        const [hourB, minuteB] = b.appointment_time
                          .split(":")
                          .map(Number);
                        return hourA * 60 + minuteA - (hourB * 60 - minuteB);
                      })
                      .map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-b border-gray-100"
                        >
                          <td className="py-3 px-4 text-gray-700">
                            {formatDate(appointment.appointment_date)}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {appointment.appointment_time}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {appointment.client_name}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {appointment.client_phone}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {appointment.service?.name}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {appointment.professional?.name}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium 
                            	${getStatusColor(appointment.status)}
															`}
                            >
                              {getStatusText(appointment.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              {appointment.status === "scheduled" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateAppointmentStatus(
                                        appointment.id,
                                        "completed"
                                      )
                                    }
                                    className="px-4 py-2 text-green-600 bg-transparent border border-gray-200 hover:border-green-600 font-bold rounded hover:bg-gray-100 transition cursor-pointer"
                                  >
                                    Concluir
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateAppointmentStatus(
                                        appointment.id,
                                        "cancelled"
                                      )
                                    }
                                    className="px-4 py-2 bg-transparent border border-gray-200 hover:border-red-600 font-bold rounded hover:bg-gray-100 transition cursor-pointer text-red-600 hover:text-red-700"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                              {currentAdmin?.role === "super_admin" && (
                                <button
                                  onClick={() =>
                                    deleteAppointment(appointment.id)
                                  }
                                  className="px-4 py-2 bg-red-600 border border-gray-800 hover:border-red-900 font-bold rounded hover:bg-red-800 transition cursor-pointer text-white"
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

              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhum agendamento encontrado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </>
  );
}
