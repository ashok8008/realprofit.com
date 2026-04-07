"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Clock } from "lucide-react";

interface Interview {
  id: string;
  company: string;
  role: string;
  date: string;
  stage: string;
  interviewer: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  outcome: string;
}

interface InterviewCardProps {
  interview: Interview;
  onUpdate: (field: keyof Interview, value: string) => void;
  onDelete: () => void;
}

export function InterviewCard({ interview, onUpdate, onDelete }: InterviewCardProps) {
  return (
    <div className={`border rounded-xl p-5 ${
      interview.status === 'upcoming' ? 'bg-amber-50/50 border-amber-200' :
      interview.status === 'completed' ? 'bg-emerald-50/50 border-emerald-200' :
      'bg-gray-50'
    }`} data-testid={`interview-card-${interview.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${
            interview.status === 'upcoming' ? 'text-amber-500' :
            interview.status === 'completed' ? 'text-emerald-500' :
            'text-gray-400'
          }`} />
          <span className={`text-xs font-semibold uppercase ${
            interview.status === 'upcoming' ? 'text-amber-600' :
            interview.status === 'completed' ? 'text-emerald-600' :
            'text-gray-500'
          }`}>{interview.status}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs">Company</Label>
          <Input value={interview.company} onChange={e => onUpdate('company', e.target.value)} placeholder="Acme Corp" />
        </div>
        <div>
          <Label className="text-xs">Role</Label>
          <Input value={interview.role} onChange={e => onUpdate('role', e.target.value)} placeholder="Software Engineer" />
        </div>
        <div>
          <Label className="text-xs">Date</Label>
          <Input type="date" value={interview.date} onChange={e => onUpdate('date', e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Stage</Label>
          <Select value={interview.stage} onValueChange={v => onUpdate('stage', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Phone Screen">Phone Screen</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Behavioral">Behavioral</SelectItem>
              <SelectItem value="Onsite">Onsite</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
              <SelectItem value="Offer">Offer Discussion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={interview.status} onValueChange={v => onUpdate('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Interviewer</Label>
          <Input value={interview.interviewer} onChange={e => onUpdate('interviewer', e.target.value)} placeholder="Jane Smith, Hiring Manager" />
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-xs">Notes / Prep</Label>
        <Textarea value={interview.notes} onChange={e => onUpdate('notes', e.target.value)} placeholder="Company research, questions to ask..." rows={2} />
      </div>

      {interview.status === 'completed' && (
        <div className="mt-4">
          <Label className="text-xs">Outcome / Feedback</Label>
          <Textarea value={interview.outcome} onChange={e => onUpdate('outcome', e.target.value)} placeholder="How did it go? What feedback?" rows={2} />
        </div>
      )}
    </div>
  );
}
