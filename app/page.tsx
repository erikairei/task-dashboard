"use client";
import useSWR from "swr";
import { useState, useEffect } from "react";
import TaskCard from "@/components/TaskCard";
import TaskDetail from "@/components/TaskDetail";
import { Task } from "@/types/task";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HomePage() {
  const { data, mutate } = useSWR<{ tasks: Task[] }>("/api/tasks?date=today", fetcher, { refreshInterval: 60000 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const tasks = data?.tasks ?? [];
  const urgent = tasks.filter((t) => {
    if (!t.deadline) return false;
    const r = new Date(t.deadline).getTime() - Date.now();
    return r > 0 && r <= 24 * 60 * 60 * 1000;
  });
  const today = tasks.filter((t) => {
    if (!t.deadline) return false;
    const r = new Date(t.deadline).getTime() - Date.now();
    return r > 24 * 60 * 60 * 1000 && r <= 3 * 24 * 60 * 60 * 1000;
  });
  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null;

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    await fetch(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  };

  const handleConfirm = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}/confirm`, { method: "PATCH" });
    mutate();
  };

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("auth") === "success") {
      setStatusMsg("Gmail連携が完了しました");
      setGmailConnected(true);
      window.history.replaceState({}, "", "/");
    } else if (p.get("error")) {
      setStatusMsg("エラー: " + p.get("error"));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setGmailConnected(d.connected))
      .catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setStatusMsg("同期中...");
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const d = await res.json();
      if (!res.ok) {
        setStatusMsg(d.error);
      } else {
        setStatusMsg(d.message + " 新規:" + d.saved + "件 スキップ:" + d.skipped + "件");
        mutate();
      }
    } catch {
      setStatusMsg("同期中にエラーが発生しました");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">業務依頼ダッシュボード</h1>
            <p className="text-xs text-gray-400">本日の依頼 {tasks.length}件</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={gmailConnected ? "text-xs px-2 py-1 rounded-full font-medium border bg-green-50 border-green-200 text-green-700" : "text-xs px-2 py-1 rounded-full font-medium border bg-gray-50 border-gray-200 text-gray-400"}>
              {gmailConnected ? "Gmail連携済み" : "Gmail未連携"}
            </span>
            {!gmailConnected && (
              <a href="/api/auth/google" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-medium">
                Gmail連携
              </a>
            )}
            <button
              onClick={handleSync}
              disabled={syncing || !gmailConnected}
              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-40 font-medium"
            >
              {syncing ? "同期中..." : "メール同期"}
            </button>
          </div>
        </div>
        {statusMsg && (
          <div className="max-w-4xl mx-auto mt-2">
            <p className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700">{statusMsg}</p>
          </div>
        )}
      </header>
      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-3 border bg-red-50 border-red-200">
            <div className="text-2xl font-bold text-red-700">{urgent.length}</div>
            <div className="text-xs font-medium text-red-600 mt-0.5">緊急(24時間以内)</div>
          </div>
          <div className="rounded-xl p-3 border bg-amber-50 border-amber-300">
            <div className="text-2xl font-bold text-amber-700">{today.length}</div>
            <div className="text-xs font-medium text-amber-600 mt-0.5">今日中(3日以内)</div>
          </div>
          <div className="rounded-xl p-3 border bg-white border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{tasks.length}</div>
            <div className="text-xs font-medium text-gray-500 mt-0.5">本日の業務依頼</div>
          </div>
        </div>
        <div>
          {urgent.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">緊急対応</div>
              {urgent.map((t) => (
                <TaskCard key={t.id} task={t} onClick={() => setSelectedId(t.id)} />
              ))}
            </div>
          )}
          {today.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">本日中</div>
              {today.map((t) => (
                <TaskCard key={t.id} task={t} onClick={() => setSelectedId(t.id)} />
              ))}
            </div>
          )}
          {tasks.filter(t => !urgent.includes(t) && !today.includes(t)).map((t) => (
            <TaskCard key={t.id} task={t} onClick={() => setSelectedId(t.id)} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              {gmailConnected ? "メール同期ボタンを押してGmailを取得してください" : "まずGmail連携ボタンを押してください"}
            </div>
          )}
        </div>
      </main>
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
