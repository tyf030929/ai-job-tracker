import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Plus, X, ExternalLink, Calendar, History, Download, Trash2, AlertTriangle } from 'lucide-react';
import { STAGE_OPTIONS, CHANNEL_OPTIONS, PROGRESS_STATUS, getStageLabel, isCompletedStage } from '@/constants/jobStages';

const JobDetailDrawer = ({
  open,
  onOpenChange,
  application,
  onUpdate,
  onDelete,
  onArchive,
  onToggleMaterial,
  onExportICS,
}) => {
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
        materials: [
          ...application.materials,
          { id: `m${Date.now()}`, name: newMaterial.trim(), completed: false },
        ],
      });
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (materialId) => {
    onUpdate(application.id, {
      materials: application.materials.filter((m) => m.id !== materialId),
    });
  };

  const completedCount = application.materials?.filter((m) => m.completed).length || 0;
  const totalMaterials = application.materials?.length || 0;
  const progress = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

  const statusConfig = PROGRESS_STATUS[application.progressStatus] || PROGRESS_STATUS.normal;
  const isCompleted = isCompletedStage(application.stage);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg max-h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <span className="text-lg font-bold">{application.companyName}</span>
                {!isCompleted && <Badge className={statusConfig.color}>{statusConfig.label}</Badge>}
              </>
            ) : (
              <span>编辑申请</span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!isEditing ? (
            <>
              {/* Basic info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">岗位</span>
                  <span className="font-medium">{application.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">当前阶段</span>
                  <Badge variant="outline">
                    {STAGE_OPTIONS.find((s) => s.value === application.stage)?.label || application.stage}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">截止日期</span>
                  <span className="font-medium">
                    {format(parseISO(application.deadline), 'yyyy年MM月dd日', { locale: zhCN })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">申请渠道</span>
                  <span>{application.channel}</span>
                </div>
                {application.salary > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">目标薪资</span>
                    <span className="text-green-600 font-medium">¥{application.salary.toLocaleString()}</span>
                  </div>
                )}
                {application.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">工作地点</span>
                    <span>{application.location}</span>
                  </div>
                )}
                {application.link && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">申请链接</span>
                    <a
                      href={application.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      查看 <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Materials checklist */}
              {totalMaterials > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">材料清单</h4>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="space-y-2">
                    {application.materials.map((material) => (
                      <div key={material.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={material.completed}
                          onCheckedChange={() => onToggleMaterial(application.id, material.id)}
                        />
                        <span className={`text-sm flex-1 ${material.completed ? 'line-through text-gray-400' : ''}`}>
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
              )}

              {/* Timeline */}
              {application.timeline && application.timeline.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    申请历史
                  </h4>
                  <div className="space-y-3">
                    {application.timeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{getStageLabel(item.stage)}</p>
                          <p className="text-xs text-gray-500">{item.note}</p>
                          <p className="text-xs text-gray-400">
                            {format(parseISO(item.date), 'yyyy-MM-dd', { locale: zhCN })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {application.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-1">备注</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {application.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button onClick={handleEdit} className="w-full">
                  编辑信息
                </Button>
                {!isCompleted && (
                  <Button
                    variant="outline"
                    onClick={() => onExportICS(application)}
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    导出日历
                  </Button>
                )}
                {!isCompleted && (
                  <Button
                    variant="outline"
                    onClick={() => onArchive(application.id)}
                    className="w-full"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    归档
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(application.id);
                    onOpenChange(false);
                  }}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              </div>
            </>
          ) : (
            /* Edit mode */
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
                      {STAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
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
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
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
                      {CHANNEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { JobDetailDrawer };