import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, ExternalLink } from 'lucide-react';
import { STAGE_OPTIONS, CHANNEL_OPTIONS, PROGRESS_STATUS } from '@/constants/jobStages';

export const JobDetailDialog = ({ open, onOpenChange, application, onUpdate, onToggleMaterial }) => {
  const [newMaterial, setNewMaterial] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  if (!application) return null;

  const handleEdit = () => {
    setEditData({ ...application });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(application.id, editData);
    setIsEditing(false);
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      onUpdate(application.id, {
        materials: [...application.materials, { 
          id: `m${Date.now()}`, 
          name: newMaterial.trim(), 
          completed: false 
        }]
      });
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (materialId) => {
    onUpdate(application.id, {
      materials: application.materials.filter(m => m.id !== materialId)
    });
  };

  const completedCount = application.materials.filter(m => m.completed).length;
  const progress = application.materials.length > 0 
    ? Math.round((completedCount / application.materials.length) * 100) 
    : 0;

  const statusConfig = PROGRESS_STATUS[application.progressStatus] || PROGRESS_STATUS.normal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <span>{application.companyName}</span>
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              </>
            ) : (
              <span>编辑申请</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">岗位</span>
                <span className="font-medium">{application.position}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">当前阶段</span>
                <Badge variant="outline">
                  {STAGE_OPTIONS.find(s => s.value === application.stage)?.label || application.stage}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">截止日期</span>
                <span className="font-medium">
                  {format(parseISO(application.deadline), 'yyyy年MM月dd日', { locale: zhCN })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">申请渠道</span>
                <span>{application.channel}</span>
              </div>
              {application.salary > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">目标薪资</span>
                  <span className="text-green-600 font-medium">¥{application.salary.toLocaleString()}</span>
                </div>
              )}
              {application.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">工作地点</span>
                  <span>{application.location}</span>
                </div>
              )}
              {application.link && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">申请链接</span>
                  <a 
                    href={application.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    查看 <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* 材料清单 */}
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">材料清单</h4>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-2">
                {application.materials.map((material) => (
                  <div key={material.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={material.completed}
                      onCheckedChange={() => onToggleMaterial(application.id, material.id)}
                    />
                    <span className={`text-sm flex-1 ${material.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {material.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemoveMaterial(material.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="添加新材料..."
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMaterial()}
                />
                <Button size="sm" className="h-8 px-2" onClick={handleAddMaterial}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 备注 */}
            {application.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">备注</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}

            <Button onClick={handleEdit} className="w-full">编辑信息</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>公司名称</Label>
              <Input
                value={editData.companyName}
                onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>岗位名称</Label>
              <Input
                value={editData.position}
                onChange={(e) => setEditData({ ...editData, position: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>当前阶段</Label>
                <Select
                  value={editData.stage}
                  onValueChange={(value) => setEditData({ ...editData, stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>进度状态</Label>
                <Select
                  value={editData.progressStatus}
                  onValueChange={(value) => setEditData({ ...editData, progressStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROGRESS_STATUS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>截止日期</Label>
                <Input
                  type="date"
                  value={editData.deadline}
                  onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>申请渠道</Label>
                <Select
                  value={editData.channel}
                  onValueChange={(value) => setEditData({ ...editData, channel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>目标薪资</Label>
                <Input
                  type="number"
                  placeholder="月薪"
                  value={editData.salary || ''}
                  onChange={(e) => setEditData({ ...editData, salary: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>工作地点</Label>
                <Input
                  placeholder="如：北京/远程"
                  value={editData.location || ''}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>申请链接</Label>
              <Input
                placeholder="https://..."
                value={editData.link || ''}
                onChange={(e) => setEditData({ ...editData, link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                rows={3}
                value={editData.notes || ''}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                保存
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
