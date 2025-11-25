// Salve este conteúdo em: src/components/QuestionBlock.tsx

'use client'; 

import { useState } from 'react';

// --- Perguntas Reais (Baseado no seu input do Kaggle) ---
//
const REAL_RIASEC_QUESTIONS = {
  1: [ // Bloco 1 (R1-R8)
    "Testar a qualidade das peças antes do envio",
    "Assentar tijolos ou azulejos em construções",
    "Trabalhar em uma plataforma de perfuração de petróleo offshore",
    "Montar peças eletrônicas",
    "Operar uma máquina de moagem em uma fábrica",
    "Consertar uma torneira quebrada",
    "Montar produtos em uma fábrica",
    "Instalar pisos em casas"
  ],
  2: [ // Bloco 2 (I1-I8)
    "Estudar a estrutura do corpo humano",
    "Estudar o comportamento animal",
    "Fazer pesquisas sobre plantas ou animais",
    "Desenvolver um novo tratamento ou procedimento médico",
    "Conduzir pesquisas biológicas",
    "Estudar baleias e outros tipos de vida marinha",
    "Trabalhar em um laboratório de biologia",
    "Fazer um mapa do fundo do oceano"
  ],
  3: [ // Bloco 3 (A1-A8)
    "Conduzir um coral musical",
    "Dirigir uma peça de teatro",
    "Design de arte para revistas",
    "Escrever uma música",
    "Escrever livros ou peças teatrais",
    "Tocar um instrumento musical",
    "Realizar acrobacias para um filme ou programa de televisão",
    "Criar cenários para peças de teatro"
  ],
  4: [ // Bloco 4 (S1-S8)
    "Orientar pessoas em suas carreiras",
    "Fazer trabalho voluntário em uma organização sem fins lucrativos",
    "Ajudar pessoas com problemas de drogas ou álcool",
    "Ensinar a um indivíduo uma rotina de exercícios",
    "Ajudar pessoas com problemas familiares",
    "Supervisionar as atividades das crianças em um acampamento",
    "Ensinar as crianças a ler",
    "Ajudar idosos com suas atividades diárias"
  ],
  5: [ // Bloco 5 (E1-E8)
    "Vender franquias de restaurantes para pessoas físicas",
    "Vender mercadorias em uma loja de departamentos",
    "Gerenciar as operações de um hotel",
    "Administrar um salão de beleza ou barbearia",
    "Gerencie um departamento dentro de uma grande empresa",
    "Gerenciar uma loja de roupas",
    "Vender casas",
    "Administrar uma loja de brinquedos"
  ],
  6: [ // Bloco 6 (C1-C8)
    "Gerar os cheques mensais de folha de pagamento para um escritório",
    "Inventariar suprimentos usando um computador hand-held", 
    "Usar um programa de computador para gerar faturas de clientes",
    "Manter registros de funcionários",
    "Calcular e registrar dados estatísticos e outros dados numéricos",
    "Operar uma calculadora",
    "Lidar com transações bancárias de clientes",
    "Manter registros de envio e recebimento"
  ]
};
// --- Fim das Perguntas Reais ---

interface QuestionBlockProps {
  blockNumber: number; 
  onBlockComplete: (answers: number[]) => void; 
}

export default function QuestionBlock({ blockNumber, onBlockComplete }: QuestionBlockProps) {
  
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  
  // Agora usamos as perguntas reais
  const questions = REAL_RIASEC_QUESTIONS[blockNumber as keyof typeof REAL_RIASEC_QUESTIONS];
  
  // --- MUDANÇA CRÍTICA: Atualizando a escala para 1-5 ---
  //
  const answerOptions = [
    { label: "Detesto", value: 1 },
    { label: "Não Gosto", value: 2 },
    { label: "Neutro", value: 3 },
    { label: "Gosto", value: 4 },
    { label: "Gosto Muito", value: 5 }, // Ou "Aproveito", como no original
  ];
  
  const handleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleNextClick = () => {
    if (Object.keys(answers).length !== 8) {
      alert("Por favor, responda todas as 8 perguntas.");
      return;
    }
    
    const answerList = Object.values(answers);
    onBlockComplete(answerList);
  };
  
  return (
    <div>
      <div className="space-y-6"> 
        {questions.map((question, index) => (
          <div key={index} className="p-4 rounded-md bg-brand-question-bg">
            <p className="font-medium mb-3">{index + 1}. {question}</p>
            
            {/* Agora renderiza 5 botões de rádio */}
            <div className="flex flex-wrap gap-4"> {/* Usamos 'flex-wrap' e 'gap' para responsividade */}
              {answerOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option.value}
                    checked={answers[index] === option.value}
                    onChange={() => handleAnswerChange(index, option.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-right">
        <button
          onClick={handleNextClick}
          disabled={Object.keys(answers).length !== 8}
          className="px-6 py-2 bg-brand-grad-dark text-white rounded-md hover:shadow-lg hover:cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}