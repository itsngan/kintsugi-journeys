import React, { useState, useRef, useEffect } from 'react';
import { JourneyNode } from '@/types/journey';
import { Plus, GripVertical, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface JourneyGraphProps {
  nodes: JourneyNode[];
  onNodesChange?: (nodes: JourneyNode[]) => void;
  isEditable?: boolean;
  compact?: boolean;
}

const JourneyGraph: React.FC<JourneyGraphProps> = ({
  nodes,
  onNodesChange,
  isEditable = true,
  compact = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [localNodes, setLocalNodes] = useState(nodes);
  const [editFormData, setEditFormData] = useState<JourneyNode | null>(null);

  useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes]);

  const width = compact ? 400 : 900;
  const height = compact ? 120 : 250;
  const padding = compact ? 30 : 60;
  const centerY = height / 2;

  // Sort nodes by date
  const sortedNodes = [...localNodes].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate x positions
  const nodePositions = sortedNodes.map((node, index) => ({
    ...node,
    x: padding + (index / (sortedNodes.length - 1 || 1)) * (width - padding * 2),
    y: centerY - (node.yOffset / 100) * (centerY - (compact ? 15 : 30)),
  }));

  // Generate smooth curve path
  const generatePath = () => {
    if (nodePositions.length < 2) return '';
    
    let path = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      const controlPointX = (prev.x + curr.x) / 2;
      
      path += ` C ${controlPointX} ${prev.y}, ${controlPointX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !svgRef.current || !isEditable) return;

    const rect = svgRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newOffset = -((y - centerY) / (centerY - 30)) * 100;
    const clampedOffset = Math.max(-80, Math.min(80, newOffset));

    setLocalNodes(prev =>
      prev.map(node =>
        node.id === draggedNode ? { ...node, yOffset: clampedOffset } : node
      )
    );
  };

  const handleMouseUp = () => {
    if (draggedNode && onNodesChange) {
      onNodesChange(localNodes);
    }
    setDraggedNode(null);
  };

  const handleEditNode = (node: JourneyNode) => {
    setEditingNodeId(node.id);
    setEditFormData({ ...node });
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    
    setLocalNodes(prev =>
      prev.map(node =>
        node.id === editFormData.id ? editFormData : node
      )
    );
    
    if (onNodesChange) {
      onNodesChange(localNodes.map(node =>
        node.id === editFormData.id ? editFormData : node
      ));
    }
    
    setEditingNodeId(null);
    setEditFormData(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = localNodes.filter(n => n.id !== nodeId);
    setLocalNodes(updatedNodes);
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
    setSelectedNode(null);
    setEditingNodeId(null);
  };

  const handleAddEmptyNode = () => {
    const newNode: JourneyNode = {
      id: `node-${Date.now()}`,
      title: '',
      company: '',
      date: new Date().toISOString().slice(0, 7),
      yOffset: 0,
      description: '',
      isEmpty: true,
    };
    
    const updatedNodes = [...localNodes, newNode];
    setLocalNodes(updatedNodes);
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full overflow-x-auto",
        compact ? "py-2" : "py-4"
      )}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto min-w-[400px]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Base timeline line */}
        <line
          x1={padding}
          y1={centerY}
          x2={width - padding}
          y2={centerY}
          stroke="hsl(var(--border))"
          strokeWidth={compact ? 1 : 2}
          strokeDasharray="4 4"
          opacity={0.5}
        />

        {/* Gold journey path */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(43, 74%, 49%)" />
            <stop offset="50%" stopColor="hsl(38, 80%, 55%)" />
            <stop offset="100%" stopColor="hsl(45, 85%, 60%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow effect path */}
        <path
          d={generatePath()}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={compact ? 2 : 4}
          strokeLinecap="round"
          filter="url(#glow)"
          opacity={0.5}
        />

        {/* Main path */}
        <path
          d={generatePath()}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={compact ? 2 : 3}
          strokeLinecap="round"
        />

        {/* Nodes */}
        {nodePositions.map((node, index) => (
          <g 
            key={node.id}
            className={cn(
              "transition-transform duration-150",
              isEditable && "cursor-grab",
              draggedNode === node.id && "cursor-grabbing"
            )}
            onMouseDown={(e) => handleMouseDown(node.id, e)}
            onClick={() => !compact && setSelectedNode(selectedNode === node.id ? null : node.id)}
          >
            {/* Node glow */}
            <circle
              cx={node.x}
              cy={node.y}
              r={compact ? 6 : 10}
              fill="url(#goldGradient)"
              opacity={0.3}
              filter="url(#glow)"
            />
            
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={compact ? 4 : 8}
              fill={node.isEmpty ? "hsl(var(--muted))" : "url(#goldGradient)"}
              stroke={node.isEmpty ? "hsl(var(--border))" : "hsl(var(--background))"}
              strokeWidth={compact ? 1 : 2}
              className="transition-all duration-200"
            />

            {/* Inner glow for filled nodes */}
            {!node.isEmpty && (
              <circle
                cx={node.x}
                cy={node.y}
                r={compact ? 2 : 4}
                fill="hsl(var(--background))"
                opacity={0.4}
              />
            )}

            {/* Add icon for empty nodes */}
            {node.isEmpty && !compact && (
              <g transform={`translate(${node.x - 4}, ${node.y - 4})`}>
                <Plus className="w-2 h-2 text-muted-foreground" />
              </g>
            )}

            {/* Labels */}
            {!compact && (
              <>
                {/* Title label */}
                {!node.isEmpty && (
                  <text
                    x={node.x}
                    y={node.y + (node.yOffset > 0 ? 25 : -20)}
                    textAnchor="middle"
                    className="text-[10px] font-medium fill-foreground"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {node.title.length > 20 ? node.title.slice(0, 20) + '...' : node.title}
                  </text>
                )}

                {/* Company label */}
                {!node.isEmpty && node.company && (
                  <text
                    x={node.x}
                    y={node.y + (node.yOffset > 0 ? 38 : -33)}
                    textAnchor="middle"
                    className="text-[8px] fill-muted-foreground"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {node.company}
                  </text>
                )}

                {/* Date label */}
                <text
                  x={node.x}
                  y={centerY + 40}
                  textAnchor="middle"
                  className="text-[8px] fill-muted-foreground"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {formatDate(node.date)}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>

      {/* Selected node details with full editing */}
      {selectedNode && !compact && (
        <div className="mt-4 p-4 bg-card rounded-lg border border-border animate-scale-in">
          {(() => {
            const node = localNodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            if (editingNodeId === node.id && editFormData) {
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-serif text-lg text-foreground">Edit Entry</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNodeId(null);
                        setEditFormData(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Title</label>
                    <Input
                      value={editFormData.title}
                      onChange={(e) => setEditFormData(prev => prev ? { ...prev, title: e.target.value } : null)}
                      placeholder="Journey milestone title..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Company/Organization</label>
                    <Input
                      value={editFormData.company || ''}
                      onChange={(e) => setEditFormData(prev => prev ? { ...prev, company: e.target.value } : null)}
                      placeholder="Company or organization..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Date (YYYY-MM)</label>
                    <Input
                      type="month"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData(prev => prev ? { ...prev, date: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <Textarea
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
                      placeholder="Tell your story..."
                      className="mt-1 resize-none"
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground italic">
                    Position on chart: {editFormData.yOffset > 0 ? 'Success' : editFormData.yOffset < 0 ? 'Struggle' : 'Neutral'}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={handleSaveEdit}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        handleDeleteNode(node.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-primary" />
                    <h4 className="font-serif text-lg text-foreground">
                      {node.isEmpty ? 'Add your story here' : node.title}
                    </h4>
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNode(node)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                {node.company && (
                  <p className="text-sm text-muted-foreground">{node.company}</p>
                )}
                <p className="text-sm text-muted-foreground">{formatDate(node.date)}</p>
                {node.description && (
                  <p className="text-sm text-foreground/80 mt-2">{node.description}</p>
                )}
                <p className="text-xs text-muted-foreground italic">
                  Drag the node up for success, down for struggle
                </p>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Add new node button */}
      {isEditable && !compact && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddEmptyNode}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Journey Entry
          </Button>
        </div>
      )}
    </div>
  );
};

export default JourneyGraph;
