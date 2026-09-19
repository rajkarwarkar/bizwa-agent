"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DEMO_BUSINESS_ID } from "@/lib/utils";
import { toast } from "sonner";
import type { KnowledgeItem, KnowledgeCategory } from "@/lib/types";

const CATEGORIES: { value: KnowledgeCategory; label: string }[] = [
  { value: "tour_packages", label: "Tour Packages" },
  { value: "pricing", label: "Pricing" },
  { value: "policies", label: "Policies" },
  { value: "faq", label: "FAQ" },
  { value: "contact", label: "Contact" },
  { value: "hours", label: "Hours" },
  { value: "general", label: "General" },
];

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general" as KnowledgeCategory,
  });

  useEffect(() => {
    fetchKnowledge();
  }, []);

  async function fetchKnowledge() {
    try {
      const res = await fetch(`/api/knowledge?business_id=${DEMO_BUSINESS_ID}`);
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch knowledge:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? { ...formData, id: editingItem.id }
        : { ...formData, business_id: DEMO_BUSINESS_ID };

      const res = await fetch("/api/knowledge", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingItem ? "Knowledge item updated" : "Knowledge item added");
        setDialogOpen(false);
        resetForm();
        fetchKnowledge();
      }
    } catch {
      toast.error("Failed to save knowledge item");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this knowledge item?")) return;
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Knowledge item deleted");
        fetchKnowledge();
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  function openEdit(item: KnowledgeItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
    });
    setDialogOpen(true);
  }

  function openAdd() {
    resetForm();
    setDialogOpen(true);
  }

  function resetForm() {
    setEditingItem(null);
    setFormData({ title: "", content: "", category: "general" });
  }

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            Manage the business knowledge that powers your AI assistant.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-32 mb-3" />
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="col-span-full border-border/50">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No knowledge items found.</p>
            </CardContent>
          </Card>
        )}

        {filtered.map((item) => (
          <Card key={item.id} className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-sm truncate">{item.title}</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {CATEGORIES.find((c) => c.value === item.category)?.label ||
                    item.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6">
                {item.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Knowledge Item" : "Add Knowledge Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Cancellation Policy"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(val) => {
                  if (val) setFormData({
                    ...formData,
                    category: val as KnowledgeCategory,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="The information the AI will use to answer questions..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim()}
            >
              {editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
