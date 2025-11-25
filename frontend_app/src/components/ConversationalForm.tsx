// Salve este conteúdo em: src/components/ConversationalForm.tsx

'use client'; 

import { useState } from 'react';
import QuestionBlock from './QuestionBlock';
// 1. IMPORTAMOS NOSSO "CONECTOR" DE API
import { fetchProfile, ProfileResult } from '@/lib/api';

const TOTAL_STEPS = 6;

export default function ConversationalForm() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<number[]>([]);
  
  // Agora o 'result' usará a interface que definimos no api.ts
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Adicionamos um estado para guardar mensagens de erro
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = (blockAnswers: number[]) => {
    const newAnswers = [...answers, ...blockAnswers];
    setAnswers(newAnswers);

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  // 2. A FUNÇÃO 'handleSubmit' ATUALIZADA
  const handleSubmit = async (finalAnswers: number[]) => {
    setIsLoading(true);
    setError(null); // Limpa erros antigos
    console.log("Enviando para a API:", finalAnswers);

    try {
      // 3. REMOVEMOS A SIMULAÇÃO (setTimeout)
      // E CHAMAMOS NOSSA FUNÇÃO DE API REAL
      //
      const profileData = await fetchProfile(finalAnswers);
      
      // Sucesso!
      setResult(profileData);
      
    } catch (err) {
      // Se o 'fetchProfile' lançar um erro (ex: 500 ou API offline)
      //
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      // Independentemente de sucesso ou falha, paramos o "carregamento"
      setIsLoading(false);
    }
  };

  // 3. Renderização (com tratamento de erro)
  
  if (isLoading) {
    return <div className="text-center p-10">Analisando seu perfil...</div>;
  }
  
  // Se tivermos um erro da API, mostre ao usuário
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
        <h2 className="font-bold mb-2">Erro ao Processar</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} // Botão simples de "tentar novamente"
          className="mt-4 px-4 py-2 bg-brand-grad-dark text-white rounded-md hover:shadow-lg hover:cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (result) {
    // Passo Final: Mostra o resultado (igual a antes)
    //
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{result.perfil}</h2>
        <p className="text-gray-700">{result.descricao}</p>
        <h3 className="text-lg font-semibold mt-6 mb-2">Carreiras Sugeridas:</h3>
        <ul className="list-disc list-inside text-gray-700">
          {result.carreiras_sugeridas.map((career) => (
            <li key={career}>{career}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Renderiza o bloco de perguntas atual (igual a antes)
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-brand-grad-light h-2.5 rounded-full" 
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        ></div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Bloco {step} de {TOTAL_STEPS}</h2>
      
      <QuestionBlock 
        blockNumber={step} 
        onBlockComplete={handleNextStep} 
      />
    </div>
  );
}