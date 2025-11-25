// Salve este conteúdo em: src/app/page.tsx

// Importamos o "cérebro" do nosso formulário, que acabamos de criar
import ConversationalForm from "@/components/ConversationalForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl"> {/* Define a largura máxima do nosso formulário */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Descubra seu Perfil de Carreira
        </h1>

        {/* Aqui é onde o Next.js irá renderizar nosso componente de formulário.
          Toda a lógica dos 6 passos acontecerá DENTRO dele.
        */}
        <ConversationalForm />
      </div>
    </main>
  );
}