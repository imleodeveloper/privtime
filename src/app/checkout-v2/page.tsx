"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LogoPix from "/pix-svg.svg";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { formatPrice, plans } from "../../../lib/plans";
import React, { useState, useEffect } from "react";
import {
  BadgeCheck,
  CheckCircle,
  Copy,
  CreditCard,
  ExternalLink,
  Info,
  LockKeyhole,
  MessageSquareWarning,
  MoveUpRight,
  PanelTopOpen,
  Star,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface FaqQuestions {
  question: string;
  answer: string;
}

const faqQuestions: FaqQuestions[] = [
  {
    question: "Como posso alterar o plano antes de finalizar a compra?",
    answer:
      "Você pode selecionar outro plano diretamente na página de checkout ou voltar à página de planos para escolher uma nova opção. Assim que selecionar, o resumo do pedido será atualizado automaticamente.",
  },
  {
    question: "Quais métodos de pagamento vocês aceitam?",
    answer:
      "Aceitamos cartões de crédito, PIX e pagamentos recorrentes via assinatura. Todas as transações são processadas de forma 100% segura.",
  },
  {
    question: "Minha assinatura é renovada automaticamente?",
    answer:
      "Sim, as assinaturas mensais e anuais são renovadas automaticamente ao final do período contratado. Você pode cancelar a renovação a qualquer momento pelo painel do usuário.",
  },
  {
    question: "Minhas informações de pagamento estão seguras?",
    answer:
      "Sim, utilizamos gateways de pagamento confiáveis e certificados (do Mercado Pago) que garantem a segurança de todos os dados transacionados.",
  },
  {
    question: "Receberei acesso imediato após o pagamento?",
    answer:
      "Pagamentos com cartão de crédito e PIX têm confirmação instantânea.",
  },
  {
    question: "Posso cancelar minha assinatura e obter reembolso?",
    answer:
      "Você pode cancelar a qualquer momento. Se o cancelamento for solicitado em até 7 dias após a compra, oferecemos reembolso integral, conforme o Código de Defesa do Consumidor.",
  },
];

interface CustomerData {
  id: string;
  email: string;
  name: string;
  phone: string;
  identity: string;
}

interface FetchProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  identity: string;
  slug_link: string;
  birthdate: string;
}

interface InfoUser {
  email: string;
  full_name: string;
  identity: string;
  typeDoc: string;
  phone: string;
}

interface InfoForPaymentCreditCard {
  email: string;
  full_name: string;
  identity: string;
  typeDoc: string;
  phone: string;
  cep: string;
  state: string;
  city: string;
  address: string;
  neighborhood: string;
  numberHouse: string;
  complement: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}
interface InfoForPaymentPix {
  email: string;
  full_name: string;
  identity: string;
  typeDoc: string;
  phone: string;
}

interface UsePix {
  qr_code: string;
  qr_code_url: string;
}

export default function CheckoutPage() {
  //const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  //const planURL = searchParams.get("plan"); //Pega o plan da URL ex: https://privtime.com.br/checkout?plan=monthly_plan
  const [planURL, setPlanURL] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [changePlan, setChangePlan] = useState(false);
  const [userData, setUserData] = useState<CustomerData>({
    id: "",
    email: "",
    name: "",
    phone: "",
    identity: "",
  });
  const [fetchProfile, setFetchProfile] = useState<FetchProfile>({
    id: "",
    full_name: "",
    email: "",
    phone: "",
    identity: "",
    slug_link: "",
    birthdate: "",
  });
  const [showPaymentStep, setShowPaymentStep] = useState(false);

  // FORM DE CHECKOUT
  const [fullNameValue, setFullNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [docType, setDocType] = useState<"cpf" | "cnpj">("cpf");
  const [docValue, setDocValue] = useState("");
  const [telValue, setTelValue] = useState("");
  const [infoUser, setInfoUser] = useState<InfoUser>({
    email: emailValue,
    full_name: fullNameValue,
    identity: docValue,
    typeDoc: docType,
    phone: telValue,
  });

  // FORM DE CHECKOUT V2
  const [isLoading, setIsLoading] = useState(false);
  const [showInstallments, setShowInstallments] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(true);
  const [cep, setCep] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [numberHouse, setNumberHouse] = useState<string>("");
  const [complement, setComplement] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");

  const [usePix, setUsePix] = useState<UsePix>({
    qr_code: "",
    qr_code_url: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "pix">(
    "credit_card"
  );

  const handleFetchCEP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepValue = e.target.value.replace(/\D/g, "");
    setCep(cepValue);

    if (cepValue.length !== 8) {
      setError("O CEP tem que conter 8 digitos, tente novamente.");
      return;
    }
    if (cepValue.length === 8) {
      setError("");
    }
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://viacep.com.br/ws/${cepValue}/json/`
      );
      const data = await response.json();
      if (data.erro) {
        setError("CEP não encontrado, tente outro CEP.");
        return;
      }
      // console.log("VIACEP: ", data);

      setNeighborhood(data.bairro);
      setCep(data.cep);
      setState(data.uf);
      setCity(data.localidade);
      setAddress(data.logradouro);

      setIsLoadingCep(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao procurar CEP:", error);
      setError("Erro ao procurar CEP no servidor. Tente novamente");
      return;
    }
  };

  const handleChangeDoc = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocType(e.target.value as "cpf" | "cnpj");
    setDocValue("");
  };
  const formatName = (value: string) => {
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  const handleFullName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullNameValue(formatName(e.target.value));
  };
  const formatTel = (value: string) => {
    // Remove tudo que não for número
    let digits = value.replace(/\D/g, "");

    // Limita para 11 digitos (ddd + 9 digit)
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    // Monta no formato XX XXXXX-XXXX
    if (digits.length > 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      return `(${digits})`;
    }

    return "";
  };
  const formatIdentity = (value: string, identity: "cpf" | "cnpj") => {
    let digits = value.replace(/\D/g, "");
    if (identity === "cpf") {
      // Limita para 11 digitos de CPF
      digits = digits.slice(0, 11);

      // Monta no formato XXX.XXX.XXX-XX
      if (digits.length > 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
          6,
          9
        )}-${digits.slice(9)}`;
      } else if (digits.length > 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      } else if (digits.length > 3) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      } else {
        return digits;
      }
    }
    if (identity === "cnpj") {
      // Limita para 14 digitos de CNPJ
      digits = digits.slice(0, 14);

      // Monta no formato XX.XXX.XXX/XXXX-XX
      if (digits.length > 12) {
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
          5,
          8
        )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
      } else if (digits.length > 8) {
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
          5,
          8
        )}/${digits.slice(8)}`;
      } else if (digits.length > 5) {
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
      } else if (digits.length > 2) {
        return `${digits.slice(0, 2)}.${digits.slice(2)}`;
      } else {
        return digits;
      }
    }

    return digits;
  };
  const formatCardNumber = (value: string) => {
    let digits = value.replace(/\D/g, ""); // remove tudo que não é número
    if (digits.length > 16) digits = digits.slice(0, 16);

    let formatted = "";
    for (let i = 0; i < digits.length; i += 4) {
      if (formatted) formatted += " ";
      formatted += digits.slice(i, i + 4);
    }

    return formatted;
  };
  const formatExpiry = (value: string) => {
    let digits = value.replace(/\D/g, ""); // remove tudo que não for número
    if (digits.length > 4) digits = digits.slice(0, 4);

    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length >= 1) {
      return digits;
    }

    return "";
  };

  const handleChangeTel = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelValue(formatTel(e.target.value));
  };
  const handleChangeIdentity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocValue(formatIdentity(e.target.value, docType));
  };

  // Qual plano foi selecionado
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(
    null
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");

    setPlanURL(plan);

    if (plan) {
      const selected = plans.find((p) => p.link === plan);
      setSelectedPlan(selected || null);
    } else {
      // redireciona se não tiver plan
      const currentURL = window.location.pathname + window.location.search;
      router.push(`/?redirect=${encodeURIComponent(currentURL)}`);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Redireciona para o login se não tiver sessão logada
          const currentURL = window.location.pathname + window.location.search;
          router.push(`/signin?redirect=${encodeURIComponent(currentURL)}`);
          return;
        }

        const response = await fetch("/api/auth/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        });

        if (response.status === 401) {
          // Redireciona para o login se já tiver plano
          router.push(`/perfil/assinaturas?msg=existing_plan`);
          return;
        }

        if (session.user) {
          setUserData((prev) => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name || "",
            phone: session.user.user_metadata?.phone || "",
            identity: session.user.user_metadata?.identity || "",
          }));

          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.log("Não foi possível localizar as informações do usuário");
          }

          if (data) {
            setFetchProfile({
              id: data.id,
              full_name: data.full_name,
              email: data.email,
              phone: data.phone,
              identity: data.identity,
              slug_link: data.slug_link,
              birthdate: data.birthdate,
            });
          }
        }

        const responseFetchInfoUser = await fetch(
          "/api/auth/checkout/fetch-user",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.id }),
          }
        );

        const dataResponseFetchInfoUser = await responseFetchInfoUser.json();

        setDocType("cpf");
        setDocValue(
          formatIdentity(dataResponseFetchInfoUser.infoUser.identity, "cpf")
        );
        setTelValue(formatTel(dataResponseFetchInfoUser.infoUser.phone));
        setEmailValue(dataResponseFetchInfoUser.infoUser.email);
        setFullNameValue(dataResponseFetchInfoUser.infoUser.full_name);
      } catch (error) {
        console.error(
          "Erro ao verificar sessão ou localizar informações do usuário: ",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  // console.log(fetchProfile);
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (fetchProfile && selectedPlan) {
  //     try {
  //       const response = await fetch("/api/pagar_me/checkout", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ profile: fetchProfile, plan: selectedPlan }),
  //       });

  //       if (!response.ok) {
  //         alert("Erro ao criar checkout Pagar Me. Tente novamente");
  //         return;
  //       }

  //       const data = await response.json();

  //       window.location.href = data.url;
  //     } catch (error) {
  //       console.error("Erro interno no servidor: ", error);
  //       alert("Erro interno no servidor. Tente novamente");
  //     }
  //   }
  // };

  const handleSubmitCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const infoUserToSend: InfoUser = {
      email: emailValue,
      full_name: fullNameValue,
      identity: docValue,
      typeDoc: docType,
      phone: telValue,
    };

    const response = await fetch("/api/pagar_me/checkout-v2/verify-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(infoUserToSend),
    });

    const data = await response.json();

    if (data.message) {
      setError(data.message);
      return;
    }
    setError("");
    setShowPaymentStep(data.showPayments);
  };

  const handleSubmitPaymentCreditCard = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);

    if (paymentMethod === "credit_card") {
      const infoForPayment: InfoForPaymentCreditCard = {
        email: emailValue,
        full_name: fullNameValue,
        identity: docValue,
        typeDoc: docType,
        phone: telValue,
        cep: cep,
        state: state,
        city: city,
        address: address,
        neighborhood: neighborhood,
        numberHouse: numberHouse,
        complement: complement,
        cardNumber: cardNumber,
        cardHolder: cardHolder,
        expiry: expiry,
        cvv: cvv,
      };
      try {
        const response = await fetch("/api/pagar_me/checkout-v2/credit_card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            infoForPayment,
            selectedPlan,
            fetchProfile,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.message);
          setIsLoading(false);
          return;
        }

        if (data.message) {
          setError(data.message);
          setIsLoading(false);
          return;
        }

        if (data.subscription.billing_type === "prepaid") {
          setSuccess(
            "Pagamento pendente de confirmação, redirecionando para página de pêndencia."
          );
          setTimeout(
            () => (window.location.href = "/checkout-v2/pending"),
            5000
          );
          setIsLoading(false);
        }

        setIsLoading(false);
      } catch (error) {
        setError(
          "Erro interno no servidor, não foi possível realizar pagamento."
        );
        setIsLoading(false);
        console.error("Erro interno do servidor: ", error);
        return;
      }
    }
  };

  const handleSubmitPaymentPix = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (paymentMethod === "pix") {
        const infoForPayment: InfoForPaymentPix = {
          email: emailValue,
          full_name: fullNameValue,
          identity: docValue,
          typeDoc: docType,
          phone: telValue,
        };

        const responsePix = await fetch("/api/pagar_me/checkout-v2/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ infoForPayment, selectedPlan, fetchProfile }),
        });

        const dataPix = await responsePix.json();
        const pix_transaction = dataPix.pix_transaction;
        setUsePix({
          qr_code: pix_transaction.qr_code,
          qr_code_url: pix_transaction.qr_code_url,
        });
        setIsLoading(false);
        setShowPaymentStep(!showPaymentStep);
      }
    } catch (error) {
      console.error("Não foi possível realizar ordem PIX:", error);
    }
  };

  const [copyPix, setCopyPix] = useState<boolean>(false);
  const handleCopyPix = () => {
    navigator.clipboard.writeText(usePix.qr_code).then(() => {
      setCopyPix(!copyPix);
    });

    setTimeout(() => setCopyPix(false), 5000);
  };

  const handleAlreadyPaymentPix = async () => {
    try {
      const responsePix = await fetch("/api/pagar_me/checkout-v2/pix", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fetchProfile }),
      });

      const dataPix = await responsePix.json();

      if (dataPix.link_href) {
        return (window.location.href = dataPix.link_href);
      } else {
        alert(dataPix.message);
      }
    } catch (error) {
      console.error("Erro interno do servidor:", error);
      setError("Erro interno do servidor");
    }
  };

  return (
    <div className="w-full">
      <Header />
      {!showPaymentStep && (
        <main className="w-full xl:px-14 py-14 relative">
          {selectedPlan ? (
            <article className="w-full container mx-auto min-h-auto gap-12 grid grid-cols-1 px-4 xl:px-0 xl:grid-cols-[1fr_1fr] items-start">
              <div className="w-full flex flex-col justify-start items-center xl:px-16 order-2 xl:order-1">
                <div className="w-full flex flex-col justify-start items-center gap-4 border-b border-gray-300 pb-6">
                  <span className="w-full text-start text-2xl text-black font-bold">
                    Método de pagamento
                  </span>
                  <div className="w-full grid grid-cols-2 items-center gap-4">
                    <div
                      onClick={() => setPaymentMethod("credit_card")}
                      className={`w-full flex justify-start items-center cursor-pointer gap-4 p-4 rounded-md ${
                        paymentMethod === "credit_card"
                          ? "bg-green-200 border border-green-600"
                          : "bg-gray-400 border border-gray-600 hover:bg-green-200 hover:border-green-600"
                      } transition-all duration-300 `}
                    >
                      <CreditCard className="w-8 h-8"></CreditCard>
                      <span className="text-lg text-gray-800 font-semibold">
                        Crédito
                      </span>
                    </div>
                    <div
                      onClick={() => setPaymentMethod("pix")}
                      className={`w-full flex justify-start items-center gap-4 p-4 rounded-md ${
                        paymentMethod === "pix"
                          ? "bg-green-200 border border-green-600"
                          : "bg-gray-400 border border-gray-600 hover:bg-green-200 hover:border-green-600"
                      }  transition-all duration-300 cursor-pointer`}
                    >
                      <Image src="/pix-svg.svg" alt="" width={30} height={30} />
                      <span className="text-lg text-gray-800 font-semibold">
                        Pix
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col justify-start items-center gap-4 border-b border-gray-300 pt-4 pb-6">
                  <span className="w-full text-start text-2xl text-black font-bold">
                    Dados pessoais
                  </span>
                  {error && (
                    <div className="w-full p-4 bg-red-100 rounded-md border border-red-600 flex justify-start items-start gap-2">
                      <MessageSquareWarning className="w-6 h-6 text-red-800"></MessageSquareWarning>{" "}
                      <span className="text-red-700 flex justify-start items-center">
                        {error}
                      </span>
                    </div>
                  )}
                  <form
                    className="w-full grid grid-cols-1 justify-center items-center gap-4"
                    onSubmit={
                      paymentMethod === "credit_card"
                        ? handleSubmitCheck
                        : handleSubmitPaymentPix
                    }
                  >
                    <div className="w-full flex flex-col justify-center items-start gap-2">
                      <label htmlFor="email" className="pl-1">
                        E-mail{" "}
                        <span className="text-main-pink font-extrabold text-lg">
                          *
                        </span>
                      </label>
                      <Input
                        type="email"
                        name="e-mail"
                        id="email"
                        required
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        placeholder="pedrosilva@exemplo.com"
                      />
                    </div>
                    <div className="w-full flex flex-col justify-center items-start gap-2">
                      <label htmlFor="name" className="pl-1">
                        Nome completo{" "}
                        <span className="text-main-pink font-extrabold text-lg">
                          *
                        </span>
                      </label>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        value={fullNameValue}
                        required
                        onChange={handleFullName}
                        placeholder="Pedro Ribeiro da Silva"
                      />
                    </div>
                    <div className="w-full grid grid-cols-[1fr_2fr] justify-center items-start gap-2">
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="docType" className="pl-1">
                          Documento{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <select
                          name="docType"
                          id="docType"
                          value={docType}
                          onChange={handleChangeDoc}
                          className="w-full text-sm bg-white px-2 py-1 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="docValue" className="pl-1">
                          Número do documento{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="docValue"
                          id="docValue"
                          required
                          placeholder={
                            docType === "cpf"
                              ? "000.000.000-00"
                              : "00.000.000/0000-00"
                          }
                          value={docValue}
                          onChange={handleChangeIdentity}
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="CodTel" className="pl-1">
                          Código do país{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <select
                          name="CodTel"
                          id="CodTel"
                          className="w-full bg-white px-2 py-2 text-sm rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="cpf">(+55)</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="telValue" className="pl-1">
                          Celular com DDD{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="telValue"
                          id="telValue"
                          required
                          placeholder={"(00) 0 0000-0000"}
                          value={telValue}
                          onChange={handleChangeTel}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center justify-center pt-4">
                      <div className="gap-2 flex justify-center items-center text-gray-600">
                        <LockKeyhole className="w-4 h-4"></LockKeyhole>
                        <span className="text-sm">Pagamento protegido</span>
                        <div className="group relative">
                          <Info className="w-4 h-4"></Info>
                          <div className="invisible group-hover:visible absolute right-0 mx-auto bottom-full w-48 h-auto px-2 py-1 rounded-md bg-gray-900 text-white text-xs">
                            <span>
                              Seu pagamento é processado de forma segura pela
                              Pagar.me, que segue o padrão internacional PCI
                              DSS.
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="gap-2 flex justify-center items-center text-gray-600">
                        <Button className="w-full flex justify-center items-center text-center gap-2 text-white text-sm font-normal">
                          <CreditCard className="w-5 h-5"></CreditCard>{" "}
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="w-full flex flex-col justify-start items-center xl:px-16 order-1 xl:order-2">
                <div className="w-full flex justify-center items-start flex-col gap-2">
                  <span className="uppercase text-gray-600 font-semibold">
                    REDEX SOLUÇÕES LTDA (PRIVETIME)
                  </span>
                  <span className="text-3xl font-bold">
                    Resumo da assinatura
                  </span>
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4">
                  {selectedPlan.type === "Anual" && (
                    <span className="text-base font-semibold">Plano Anual</span>
                  )}
                  {selectedPlan.type === "Mensal" && (
                    <span className="text-base font-semibold">
                      Plano Mensal
                    </span>
                  )}
                  {selectedPlan.type === "Test" && (
                    <span className="text-base font-semibold">Plano Teste</span>
                  )}
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4 flex flex-col justify-center items-center gap-2">
                  <span className="w-full text-start text-base font-semibold">
                    Detalhes da assinatura
                  </span>
                  <div className="w-full flex justify-between items-center">
                    <span>Frequência</span>
                    {selectedPlan.type === "Anual" ? (
                      <span>Anual (a cada 365 dias)</span>
                    ) : (
                      <span>Mensal (a cada 30 dias)</span>
                    )}
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span>Cobrança se repete</span>
                    <span>Sem prazo determinado</span>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span>Valor da assinatura</span>
                    <span>
                      {formatPrice(
                        selectedPlan.type === "Anual"
                          ? selectedPlan.price * 12
                          : selectedPlan.price
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4 flex flex-col justify-center items-center gap-2">
                  <span className="w-full text-start text-base font-semibold">
                    Entenda as cobranças
                  </span>
                  <div className="w-full flex flex-col justify-center items-start gap-6">
                    <div className="flex justify-start items-start gap-2">
                      <div className="relative">
                        <BadgeCheck className="w-8 h-8 p-1 rounded-full bg-main-pink text-white flex justify-center items-center"></BadgeCheck>
                        <div className="absolute -bottom-8 left-1/2 w-[2px] h-6 bg-main-pink"></div>
                      </div>
                      <div className="flex flex-col justify-start items-start gap-1">
                        <span className="text-black">
                          {selectedPlan.type === "Anual"
                            ? "A cada 365 dias"
                            : "A cada 30 dias"}{" "}
                          ·{" "}
                          {formatPrice(
                            selectedPlan.type === "Anual"
                              ? selectedPlan.price * 12
                              : selectedPlan.price
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          As cobranças seguintes vão ser feitas{" "}
                          {selectedPlan.type === "Anual"
                            ? "a cada 365 dias"
                            : "a cada 30 dias"}
                          .
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-start items-start gap-2 opacity-75">
                      <div className="relative">
                        <BadgeCheck className="w-8 h-8 p-1 rounded-full bg-gray-600 text-black flex justify-center items-center"></BadgeCheck>
                      </div>
                      <div className="flex flex-col justify-start items-start gap-1">
                        <span className="text-black">
                          Hoje ·{" "}
                          {formatPrice(
                            selectedPlan.type === "Anual"
                              ? selectedPlan.price * 12
                              : selectedPlan.price
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          Cobrança da assinatura ao finalizar pagamento.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className="">Não encontrado</div>
          )}
        </main>
      )}

      {showPaymentStep && paymentMethod === "credit_card" && (
        <main className="w-full xl:px-14 py-14 relative">
          {selectedPlan ? (
            <article className="w-full container mx-auto min-h-auto gap-12 grid grid-cols-1 px-4 xl:px-0 xl:grid-cols-[1fr_1fr] items-start">
              <form
                onSubmit={handleSubmitPaymentCreditCard}
                className="flex flex-col justify-start items-center xl:px-16 order-2 xl:order-1"
              >
                <div className="w-full flex flex-col justify-start items-center gap-4 border-b border-gray-300 pb-6">
                  {success && (
                    <div className="w-full p-4 bg-green-100 rounded-md border border-green-600 flex justify-start items-start gap-2">
                      <CheckCircle className="w-6 h-6 text-green-800"></CheckCircle>{" "}
                      <span className="text-green-700 flex justify-start items-center">
                        {success}
                      </span>
                    </div>
                  )}
                  <div className="w-full flex justify-between items-center">
                    <span className="text-start text-2xl text-black font-bold">
                      Endereço
                    </span>
                    <a
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-center items-center gap-2 text-main-pink font-bold underline text-sm hover:text-main-purple"
                    >
                      Não sei meu CEP (BR){" "}
                      <MoveUpRight className="w-5 h-5"></MoveUpRight>
                    </a>
                  </div>

                  {error && (
                    <div className="w-full p-4 bg-red-100 rounded-md border border-red-600 flex justify-start items-start gap-2">
                      <MessageSquareWarning className="w-6 h-6 text-red-800"></MessageSquareWarning>{" "}
                      <span className="text-red-700 flex justify-start items-center">
                        {error}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full flex flex-col justify-start items-center gap-4 border-b border-gray-300 pt-4 pb-6">
                  <div className="w-full grid grid-cols-1 justify-center items-center gap-4">
                    <div className="w-full grid grid-cols-[1fr_1fr] justify-center items-start gap-2">
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="country" className="pl-1">
                          País{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <select
                          name="country"
                          id="country"
                          disabled
                          className={`w-full text-sm bg-white px-2 py-1 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 opacity-50 `}
                        >
                          <option value="BR">Brasil</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="cepInput" className="pl-1">
                          CEP{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="cepInput"
                          id="cepInput"
                          value={cep}
                          onChange={handleFetchCEP}
                          required
                          className="text-sm"
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="state" className="pl-1">
                          Estado{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="state"
                          id="state"
                          required
                          disabled={isLoadingCep}
                          value={state}
                          placeholder="SP"
                          onChange={(e) => setState(e.target.value)}
                          className={`w-full bg-white px-2 py-2 text-sm rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
                            isLoadingCep ? "opacity-50" : "opacity-100"
                          } `}
                        ></Input>
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="city" className="pl-1">
                          Cidade{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="city"
                          id="city"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={isLoadingCep}
                          className={`text-sm ${
                            isLoadingCep ? "opacity-50" : "opacity-100"
                          }`}
                          placeholder={"São Paulo"}
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="address" className="pl-1">
                          Endereço{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="address"
                          id="address"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={isLoadingCep}
                          className={`text-sm ${
                            isLoadingCep ? "opacity-50" : "opacity-100"
                          }`}
                          placeholder={"Av. Nove de Julho"}
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="neighborhood" className="pl-1">
                          Bairro{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="neighborhood"
                          id="neighborhood"
                          required
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          disabled={isLoadingCep}
                          className={`text-sm ${
                            isLoadingCep ? "opacity-50" : "opacity-100"
                          }`}
                          placeholder={"Centro Histórico"}
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="numberHouse" className="pl-1">
                          Número{" "}
                          <span className="text-main-pink font-normal text-xs">
                            (opcional)
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="numberHouse"
                          id="numberHouse"
                          value={numberHouse}
                          onChange={(e) => setNumberHouse(e.target.value)}
                          className="text-sm"
                          placeholder={"123, 1A, 12B"}
                        />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-2">
                        <label htmlFor="complement" className="pl-1">
                          Complemento{" "}
                          <span className="text-main-pink font-normal text-xs">
                            (opcional)
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="complement"
                          id="complement"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className="text-sm"
                          placeholder={"BL 11, APT 24"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="w-full flex flex-col justify-start items-center gap-4 border-b border-gray-300 pt-4 pb-6">
                  <span className="w-full text-start text-xl text-black font-bold">
                    Deseja parcelar a compra?
                  </span>
                  <div className="w-full flex justify-start items-center gap-4">
                    <div
                      onClick={() => setShowInstallments(!showInstallments)}
                      className={`group px-4 py-2 bg-main-purple rounded-lg hover:bg-main-pink transition relative ${
                        showInstallments
                          ? "bg-transparent border border-main-pink"
                          : ""
                      }`}
                    >
                      <span
                        className={`${
                          showInstallments
                            ? "text-black group-hover:text-white"
                            : "text-white"
                        }`}
                      >
                        {showInstallments ? "Fechar parcelas" : "Ver parcelas"}
                      </span>
                      {showInstallments && (
                        <div
                          className={`absolute top-full left-0 w-full max-w-xs border border-gray-300 rounded-lg shadow bg-white`}
                        >
                          <ul>
                            <li className="p-3 flex justify-between text-sm border-b border-gray-200 pb-1 last:border-none hover:bg-gray-300 cursor-pointer">
                              <span>1x</span>
                              <span>R$ 0,00</span>
                            </li>
                            <li className="p-3 flex justify-between text-sm border-b border-gray-200 pb-1 last:border-none hover:bg-gray-300 cursor-pointer">
                              <span>2x</span>
                              <span>R$ 0,00</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div> */}
                <div className="w-full flex flex-col justify-start items-center gap-4 border-b border-gray-300 pt-4 pb-6">
                  <span className="w-full text-start text-xl text-black font-bold">
                    Dados do cartão de crédito
                  </span>
                  <div className="w-full grid grid-cols-1 items-center justify-center gap-2 p-5 rounded-md bg-sub-background">
                    <div className="w-full flex flex-col justify-center items-start gap-2">
                      <label className="" htmlFor="cardNumber">
                        Número do cartão{" "}
                        <span className="text-main-pink font-extrabold text-lg">
                          *
                        </span>
                      </label>
                      <div className="relative w-full flex justify-center items-center">
                        <Input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          required
                          value={cardNumber}
                          onChange={(e) =>
                            setCardNumber(formatCardNumber(e.target.value))
                          }
                          placeholder="0000 0000 0000 0000"
                          className="pl-10"
                        />
                        <CreditCard className="w-6 h-6 absolute top-1 left-2"></CreditCard>
                      </div>
                    </div>
                    <div className="w-full flex flex-col justify-center items-start gap-2">
                      <label className="" htmlFor="cardHolder">
                        Nome como está no cartão{" "}
                        <span className="text-main-pink font-extrabold text-lg">
                          *
                        </span>
                      </label>
                      <div className="relative w-full flex justify-center items-center">
                        <Input
                          type="text"
                          id="cardHolder"
                          name="cardHolder"
                          required
                          value={cardHolder}
                          onChange={(e) =>
                            setCardHolder(formatName(e.target.value))
                          }
                          placeholder="Pedro Silva Ribeiro"
                        />
                      </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-8">
                      <div className="w-full flex flex-col justify-center items-start gap-2">
                        <label className="" htmlFor="expiryCard">
                          Expiração{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <div className="relative w-full flex justify-center items-center">
                          <Input
                            type="text"
                            id="expiryCard"
                            name="expiryCard"
                            required
                            value={expiry}
                            onChange={(e) =>
                              setExpiry(formatExpiry(e.target.value))
                            }
                            placeholder="01/32"
                          />
                        </div>
                      </div>
                      <div className="w-full flex flex-col justify-center items-start gap-2">
                        <label className="" htmlFor="cvvCard">
                          CVV{" "}
                          <span className="text-main-pink font-extrabold text-lg">
                            *
                          </span>
                        </label>
                        <div className="relative w-full flex justify-center items-center">
                          <Input
                            type="text"
                            id="cvvCard"
                            name="cvvCard"
                            required
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-center items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-10 h-10"
                      id="accept-payment"
                      name=""
                      required
                    />
                    <label
                      className="text-sm text-gray-700 "
                      htmlFor="accept-payment"
                    >
                      Concordo com a realização de cobranças automáticas no meu
                      cartão de crédito, conforme as condições descritas no
                      resumo desta assinatura.
                    </label>
                  </div>
                  <div className="w-full flex justify-end items-center gap-2">
                    <button
                      className="px-4 py-2 text-white bg-gray-700 font-bold rounded hover:bg-gray-900 transition cursor-pointer"
                      onClick={() => setShowPaymentStep(!showPaymentStep)}
                    >
                      Voltar
                    </button>
                    <Button className="text-white" type="submit">
                      Finalizar
                    </Button>
                  </div>
                </div>
              </form>
              <div className="w-full flex flex-col justify-start items-center xl:px-16 order-1 xl:order-2">
                <div className="w-full flex justify-center items-start flex-col gap-2">
                  <span className="uppercase text-gray-600 font-semibold">
                    REDEX SOLUÇÕES LTDA (PRIVETIME)
                  </span>
                  <span className="text-3xl font-bold">
                    Resumo da assinatura
                  </span>
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4">
                  {selectedPlan.type === "Anual" && (
                    <span className="text-base font-semibold">Plano Anual</span>
                  )}
                  {selectedPlan.type === "Mensal" && (
                    <span className="text-base font-semibold">
                      Plano Mensal
                    </span>
                  )}
                  {selectedPlan.type === "Test" && (
                    <span className="text-base font-semibold">Plano Teste</span>
                  )}
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4 flex flex-col justify-center items-center gap-2">
                  <span className="w-full text-start text-base font-semibold">
                    Detalhes da assinatura
                  </span>
                  <div className="w-full flex justify-between items-center">
                    <span>Frequência</span>
                    {selectedPlan.type === "Anual" ? (
                      <span>Anual (a cada 365 dias)</span>
                    ) : (
                      <span>Mensal (a cada 30 dias)</span>
                    )}
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span>Cobrança se repete</span>
                    <span>Sem prazo determinado</span>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span>Valor da assinatura</span>
                    <span>
                      {" "}
                      {formatPrice(
                        selectedPlan.type === "Anual"
                          ? selectedPlan.price * 12
                          : selectedPlan.price
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4 flex flex-col justify-center items-center gap-2">
                  <span className="w-full text-start text-base font-semibold">
                    Entenda as cobranças
                  </span>
                  <div className="w-full flex flex-col justify-center items-start gap-6">
                    <div className="flex justify-start items-start gap-2">
                      <div className="relative">
                        <BadgeCheck className="w-8 h-8 p-1 rounded-full bg-main-pink text-white flex justify-center items-center"></BadgeCheck>
                        <div className="absolute -bottom-8 left-1/2 w-[2px] h-6 bg-main-pink"></div>
                      </div>
                      <div className="flex flex-col justify-start items-start gap-1">
                        <span className="text-black">
                          {selectedPlan.type === "Anual"
                            ? "A cada 365 dias"
                            : "A cada 30 dias"}{" "}
                          ·{" "}
                          {formatPrice(
                            selectedPlan.type === "Anual"
                              ? selectedPlan.price * 12
                              : selectedPlan.price
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          As cobranças seguintes vão ser feitas{" "}
                          {selectedPlan.type === "Anual"
                            ? "a cada 365 dias"
                            : "a cada 30 dias"}
                          .
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-start items-start gap-2 opacity-75">
                      <div className="relative">
                        <BadgeCheck className="w-8 h-8 p-1 rounded-full bg-gray-600 text-black flex justify-center items-center"></BadgeCheck>
                      </div>
                      <div className="flex flex-col justify-start items-start gap-1">
                        <span className="text-black">
                          Hoje ·{" "}
                          {formatPrice(
                            selectedPlan.type === "Anual"
                              ? selectedPlan.price * 12
                              : selectedPlan.price
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          Cobrança da assinatura ao finalizar pagamento.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isLoading && (
                <div className="w-full h-full absolute top-0 left-0 z-10 backdrop-blur-sm">
                  <div className="container mx-auto px-4 py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-36 w-36 border-b-2 border-main-pink mx-auto mb-4"></div>
                      <p className="text-gray-600 text-xl">Carregando...</p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ) : (
            <div className="">Não encontrado</div>
          )}
        </main>
      )}

      {showPaymentStep && paymentMethod === "pix" && (
        <main className="w-full xl:px-14 py-14 relative">
          {selectedPlan ? (
            <article className="w-full container mx-auto min-h-auto gap-12 grid grid-cols-1 px-4 xl:px-0 xl:grid-cols-[1fr_1fr] items-start">
              <form className="flex flex-col justify-center items-center gap-6 xl:px-16 order-2 xl:order-1">
                {usePix && (
                  <>
                    <Image
                      src={usePix.qr_code_url}
                      alt="QR Code PIX - Pagar Me"
                      className="object-cover"
                      width={180}
                      height={180}
                    />
                    <div className="text-center text-lg font-bold text-main-pink">
                      <span>
                        Caso prefira, você também pode copiar e colar o código
                        abaixo diretamente no aplicativo do seu banco:
                      </span>
                    </div>
                    <div className="w-full p-4 rounded-md bg-gray-600 text-gray-200 text-center flex flex-col justify-center items-center gap-2">
                      <div className="flex flex-col justify-center items-center relative">
                        <span
                          className={`absolute top-0 bottom-0 right-full py-1 px-2 rounded-md bg-green-600 text-center text-sm flex justfiy-center items-center font-bold  ${
                            copyPix
                              ? "opacity-100 transform -translate-x-6"
                              : "opacity-0 transform translate-x-0"
                          } transition-all duration-300`}
                        >
                          Copiado!
                        </span>
                        <Copy
                          onClick={handleCopyPix}
                          className="w-10 h-10 text-blue-600 cursor-pointer bg-gray-200 rounded-full p-1 hover:bg-green-600 hover:text-white transform hover:scale-125 transition-all duration-300"
                        ></Copy>
                      </div>
                      <span className="text-xs">{usePix.qr_code}</span>
                    </div>
                    <div className="flex justify-center items-center">
                      <Button
                        className="text-white"
                        onClick={handleAlreadyPaymentPix}
                      >
                        Já realizei o pagamento
                      </Button>
                    </div>
                    <span className="text-center text-gray-600 text-sm">
                      Este QR Code estará válido por 1 hora a partir da geração.
                    </span>
                  </>
                )}
              </form>
              <div className="w-full flex flex-col justify-start items-center xl:px-16 order-1 xl:order-2">
                <div className="w-full flex justify-center items-start flex-col gap-2">
                  <span className="uppercase text-gray-600 font-semibold">
                    REDEX SOLUÇÕES LTDA (PRIVETIME)
                  </span>
                  <span className="text-3xl font-bold">
                    Resumo da assinatura
                  </span>
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4">
                  {selectedPlan.type === "Anual" && (
                    <span className="text-base font-semibold">Plano Anual</span>
                  )}
                  {selectedPlan.type === "Mensal" && (
                    <span className="text-base font-semibold">
                      Plano Mensal
                    </span>
                  )}
                  {selectedPlan.type === "Test" && (
                    <span className="text-base font-semibold">Plano Teste</span>
                  )}
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4 flex flex-col justify-center items-center gap-2">
                  <span className="w-full text-start text-base font-semibold">
                    Detalhes da assinatura
                  </span>
                  <div className="w-full flex justify-between items-center">
                    <span>Frequência</span>
                    {selectedPlan.type === "Anual" ? (
                      <span>Anual (a cada 365 dias)</span>
                    ) : (
                      <span>Mensal (a cada 30 dias)</span>
                    )}
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span>Cobrança se repete</span>
                    <span>Sem prazo determinado</span>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span>Valor da assinatura</span>
                    <span>
                      {" "}
                      {formatPrice(
                        selectedPlan.type === "Anual"
                          ? selectedPlan.price * 12
                          : selectedPlan.price
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-full p-4 rounded-md bg-sub-background mt-4 flex flex-col justify-center items-center gap-2">
                  <span className="w-full text-start text-base font-semibold">
                    Entenda as cobranças
                  </span>
                  <div className="w-full flex flex-col justify-center items-start gap-6">
                    <div className="flex justify-start items-start gap-2">
                      <div className="relative">
                        <BadgeCheck className="w-8 h-8 p-1 rounded-full bg-main-pink text-white flex justify-center items-center"></BadgeCheck>
                        <div className="absolute -bottom-8 left-1/2 w-[2px] h-6 bg-main-pink"></div>
                      </div>
                      <div className="flex flex-col justify-start items-start gap-1">
                        <span className="text-black">
                          {selectedPlan.type === "Anual"
                            ? "A cada 365 dias"
                            : "A cada 30 dias"}{" "}
                          ·{" "}
                          {formatPrice(
                            selectedPlan.type === "Anual"
                              ? selectedPlan.price * 12
                              : selectedPlan.price
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          As cobranças seguintes vão ser feitas{" "}
                          {selectedPlan.type === "Anual"
                            ? "a cada 365 dias"
                            : "a cada 30 dias"}
                          .
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-start items-start gap-2 opacity-75">
                      <div className="relative">
                        <BadgeCheck className="w-8 h-8 p-1 rounded-full bg-gray-600 text-black flex justify-center items-center"></BadgeCheck>
                      </div>
                      <div className="flex flex-col justify-start items-start gap-1">
                        <span className="text-black">
                          Hoje ·{" "}
                          {formatPrice(
                            selectedPlan.type === "Anual"
                              ? selectedPlan.price * 12
                              : selectedPlan.price
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          Cobrança da assinatura ao finalizar pagamento.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isLoading && (
                <div className="w-full h-full absolute top-0 left-0 z-10 backdrop-blur-sm">
                  <div className="container mx-auto px-4 py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-36 w-36 border-b-2 border-main-pink mx-auto mb-4"></div>
                      <p className="text-gray-600 text-xl">Carregando...</p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ) : (
            <div className="">Não encontrado</div>
          )}
        </main>
      )}
      <Footer />
    </div>
  );
}
