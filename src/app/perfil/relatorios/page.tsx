"use client";
import {
  Calendar,
  ChevronLeft,
  Clock,
  DollarSign,
  Edit,
  Filter,
  Mail,
  Phone,
  Plus,
  Settings,
  SidebarOpen,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Header } from "../../../../components/header";
import { Footer } from "../../../../components/footer";
import { NavigationProfile } from "../../../../components/profile/navigation-profile";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { UserProfile } from "@/app/api/auth/perfil/route";
import { Banner } from "../../../../components/banner-alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../../components/ui/chart";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Admin } from "../agendamentos/page";
import { Button } from "../../../../components/ui/button";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

interface MonthlyReport {
  cancelamentos: number;
  concluidos: number;
  valorTotal: number;
  servicosMaisUtilizados: { name: string; count: number; value: number }[];
  servicosMenosUtilizados: { name: string; count: number; value: number }[];
}

interface ServiceProfessionalData {
  professionalName: string;
  count: number;
  value: number;
}

interface ServiceDetail {
  serviceName: string;
  professionals: ServiceProfessionalData[];
}

export default function ServicesPage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
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
    cep: "",
  });

  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] =
    useState<ServiceDetail | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport>({
    cancelamentos: 0,
    concluidos: 0,
    valorTotal: 0,
    servicosMaisUtilizados: [],
    servicosMenosUtilizados: [],
  });
  const [activeReportTab, setActiveReportTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

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
    fetchAdmin();
  }, [userProfile]);

  useEffect(() => {
    if (currentAdmin && selectedMonth) {
      fetchMonthlyReport(currentAdmin, selectedMonth);
    }
  }, [selectedMonth, currentAdmin]);

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
        fetchMonthlyReport(data.user_admin, selectedMonth);
        fetchAvailableMonths(data.user_admin);
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

  const fetchAvailableMonths = async (admin: Admin) => {
    try {
      let query = supabase
        .from("appointments")
        .select("appointment_date")
        .eq("slug_link", userProfile.slug_link)
        .order("appointment_date", { ascending: false });

      // Se for admin normal, filtrar apenas agendamentos do seu profissional
      if (admin.role === "admin" && admin.professional_id) {
        query = query.eq("professional_id", admin.professional_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const months = new Set<string>();
      data?.forEach((appointment) => {
        const date = new Date(appointment.appointment_date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        months.add(monthKey);
      });

      setAvailableMonths(Array.from(months).sort().reverse());
    } catch (error) {
      console.error("Erro ao carregar meses disponíveis:", error);
    }
  };

  const fetchMonthlyReport = async (admin: Admin, monthKey: string) => {
    try {
      const [year, month] = monthKey.split("-");
      const firstDay = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        1
      );
      const lastDay = new Date(
        Number.parseInt(year),
        Number.parseInt(month),
        0
      );

      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          service:services(name, price),
          professional:professionals(name)
        `
        )
        .eq("slug_link", userProfile.slug_link)
        .gte("appointment_date", firstDay.toISOString().split("T")[0])
        .lte("appointment_date", lastDay.toISOString().split("T")[0]);

      // Se for admin normal, filtrar apenas agendamentos do seu profissional
      if (admin.role === "admin" && admin.professional_id) {
        query = query.eq("professional_id", admin.professional_id);
      }

      const { data: monthlyAppointments, error } = await query;

      if (error) {
        console.log(error);
        throw error;
      }

      const cancelamentos =
        monthlyAppointments.filter((apt) => apt.status === "cancelled")
          .length || 0;
      const concluidos =
        monthlyAppointments.filter((apt) => apt.status === "completed")
          .length || 0;

      const valorTotal =
        monthlyAppointments
          .filter((apt) => apt.status === "completed")
          .reduce((total, apt) => total + (apt.service?.price || 0), 0) || 0;

      // Contar serviços utilizados
      const serviceCount: { [key: string]: { count: number; value: number } } =
        {};

      monthlyAppointments.forEach((apt) => {
        if (apt.service?.name) {
          if (!serviceCount[apt.service.name]) {
            serviceCount[apt.service.name] = { count: 0, value: 0 };
          }
          serviceCount[apt.service.name].count++;
          if (apt.status === "completed") {
            serviceCount[apt.service.name].value += apt.service.price || 0;
          }
        }
      });

      const sortedServices = Object.entries(serviceCount)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

      const servicosMaisUtilizados = sortedServices.slice(0, 5);
      const servicosMenosUtilizados = sortedServices.slice(-5).reverse();

      setMonthlyReport({
        cancelamentos,
        concluidos,
        valorTotal,
        servicosMaisUtilizados,
        servicosMenosUtilizados,
      });
    } catch (error) {
      console.error("Erro ao carregar relatório mensal:", error);
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

  const fetchServiceProfessionalDetail = async (
    serviceName: string,
    monthKey: string
  ) => {
    try {
      const [year, month] = monthKey.split("-");
      const firstDay = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        1
      );
      const lastDay = new Date(
        Number.parseInt(year),
        Number.parseInt(month),
        0
      );

      const query = supabase
        .from("appointments")
        .select(
          `
          *,
          service:services(name, price),
          professional:professionals(name)
        `
        )
        .eq("slug_link", userProfile.slug_link)
        .gte("appointment_date", firstDay.toISOString().split("T")[0])
        .lte("appointment_date", lastDay.toISOString().split("T")[0]);

      // Se for admin normal, filtrar apenas agendamentos do seu profissional
      // if (currentAdmin?.role === "admin" && currentAdmin.professional_id) {
      //   query = query.eq("professional_id", currentAdmin.professional_id);
      // }

      const { data: appointments, error } = await query;

      if (error) throw error;

      // Filtrar apenas os agendamentos do serviço específico
      const serviceAppointments =
        appointments?.filter((apt) => apt.service?.name === serviceName) || [];

      // Agrupar por profissional
      const professionalData: {
        [key: string]: { count: number; value: number };
      } = {};

      serviceAppointments.forEach((apt) => {
        const professionalName =
          apt.professional?.name || "Profissional não identificado";
        if (!professionalData[professionalName]) {
          professionalData[professionalName] = { count: 0, value: 0 };
        }
        professionalData[professionalName].count++;
        if (apt.status === "completed") {
          professionalData[professionalName].value += apt.service?.price || 0;
        }
      });

      const professionals = Object.entries(professionalData)
        .map(([professionalName, data]) => ({
          professionalName,
          ...data,
        }))
        .sort((a, b) => b.count - a.count);

      setSelectedServiceDetail({
        serviceName,
        professionals,
      });
    } catch (error) {
      console.error("Erro ao carregar detalhes do serviço:", error);
    }
  };

  const chartConfig = {
    count: {
      label: "Quantidade",
      color: "hsl(var(--chart-1))",
    },
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });
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

  if (selectedServiceDetail) {
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
          <NavigationProfile
            open={openMenu}
            onClose={() => setOpenMenu(false)}
          />
          <article className="relative w-full lg:w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-24 lg:pt-12 px-6">
            <div
              className="lg:hidden absolute top-4 left-4 flex justify-center items-center p-2 cursor-pointer hover:bg-main-pink hover:text-white rounded-full lg:hidden"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <SidebarOpen className="w-7 h-7"></SidebarOpen>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setSelectedServiceDetail(null)}
                className="flex items-center space-x-2 text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <h3 className="text-lg font-semibold text-gray-900">
                Detalhes do Serviço: {selectedServiceDetail.serviceName}
              </h3>
            </div>

            <Card className="bg-white w-full shadow-xl border-main-pink/40">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Profissionais que realizaram{" "}
                  {selectedServiceDetail.serviceName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedServiceDetail.professionals.map(
                    (professional, index) => (
                      <div
                        key={professional.professionalName}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {professional.professionalName}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Quantidade</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {professional.count}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Valor Total</p>
                            <p className="text-lg font-semibold text-green-600">
                              R$ {professional.value.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {selectedServiceDetail.professionals.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nenhum profissional realizou este serviço no período
                      selecionado.
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
          <Tabs
            value={activeReportTab}
            onValueChange={setActiveReportTab}
            className="space-y-6 w-full"
          >
            <div className="flex flex-wrap items-center gap-4 justify-center md:gap-0 md:justify-between">
              <TabsList className="shadow-xl bg-sub-background">
                <TabsTrigger
                  value="overview"
                  className="cursor-pointer hover:bg-main-pink/20"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="cursor-pointer hover:bg-main-pink/20"
                >
                  Serviços Detalhados
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <label className="text-sm text-gray-600">Mês:</label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-32 bg-sub-background shadow-xl border-main-pink/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-sub-background shadow-xl border-main-pink/40">
                      {availableMonths.map((month) => (
                        <SelectItem key={month} value={month}>
                          {formatMonthLabel(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white shadow-xl border-main-pink/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">
                      Cancelamentos do Mês
                    </CardTitle>
                    <X className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {monthlyReport.cancelamentos}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-xl border-main-pink/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">
                      Concluídos do Mês
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {monthlyReport.concluidos}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-xl border-main-pink/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">
                      Valor Total (Concluídos)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {monthlyReport.valorTotal.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-xl border-main-pink/20">
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      Serviços Mais Utilizados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center">
                    <ChartContainer
                      config={chartConfig}
                      className="w-full h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyReport.servicosMaisUtilizados}>
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            radius={[10, 10, 0, 0]}
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-xl border-main-pink/20">
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      Distribuição de Serviços
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center">
                    <ChartContainer
                      config={chartConfig}
                      className="w-full h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthlyReport.servicosMaisUtilizados}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {monthlyReport.servicosMaisUtilizados.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white shadow-xl border-main-pink/20">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Ranking de Serviços por Utilização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Mais Utilizados
                      </h4>
                      <div className="space-y-2">
                        {monthlyReport.servicosMaisUtilizados.map(
                          (service, index) => (
                            <div
                              key={service.name}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() =>
                                fetchServiceProfessionalDetail(
                                  service.name,
                                  selectedMonth
                                )
                              }
                            >
                              <span className="text-sm text-gray-700">
                                {index + 1}. {service.name}
                              </span>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                  {service.count} vezes
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                  R$ {service.value.toFixed(2)}
                                </span>
                                <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <Card className="bg-white shadow-xl border-main-pink/20">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Todos os Serviços - {formatMonthLabel(selectedMonth)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthlyReport.servicosMaisUtilizados.map((service) => (
                      <div
                        key={service.name}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() =>
                          fetchServiceProfessionalDetail(
                            service.name,
                            selectedMonth
                          )
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {service.name}
                          </h3>
                          <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quantidade:</span>
                            <span className="font-medium text-gray-900">
                              {service.count}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valor Total:</span>
                            <span className="font-medium text-green-600">
                              R$ {service.value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {monthlyReport.servicosMaisUtilizados.length === 0 && (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Nenhum serviço foi utilizado no período selecionado.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </article>
      </main>
      <Footer />
    </>
  );
}
