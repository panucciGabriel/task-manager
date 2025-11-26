import { TaskManager } from "@/components/TaskManager";
import { getTasks } from "@/actions/tasks";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tasks = await getTasks();

  return (
    <main className="min-h-screen py-8 sm:py-12">
      <TaskManager initialTasks={tasks} />
    </main>
  );
}
