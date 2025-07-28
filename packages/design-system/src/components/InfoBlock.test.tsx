import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InfoBlock } from './InfoBlock';

describe('InfoBlock Component', () => {
  const mockSections = [
    { label: 'Name', value: 'John Doe' },
    { label: 'Age', value: '30' },
    { label: 'Status', value: 'Active', highlight: true },
  ];

  it('renders title correctly', () => {
    render(<InfoBlock title="User Info" sections={mockSections} />);
    expect(screen.getByText('User Info')).toBeInTheDocument();
  });

  it('renders all sections', () => {
    render(<InfoBlock title="Test" sections={mockSections} />);
    
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Age:')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies highlight styling when specified', () => {
    render(<InfoBlock title="Test" sections={mockSections} />);
    
    const activeStatus = screen.getByText('Active');
    expect(activeStatus).toHaveClass('text-primary');
  });

  it('renders with default 3 columns', () => {
    const { container } = render(<InfoBlock title="Test" sections={mockSections} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1 md:grid-cols-3');
  });

  it('renders with custom column count', () => {
    const { container } = render(<InfoBlock title="Test" sections={mockSections} columns={2} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1 md:grid-cols-2');
  });

  it('applies muted background styling', () => {
    const { container } = render(<InfoBlock title="Test" sections={mockSections} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-muted/50 rounded-lg p-6');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <InfoBlock title="Test" sections={mockSections} className="custom-class" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('renders React nodes as values', () => {
    const sectionsWithNode = [
      { label: 'Status', value: <span data-testid="custom-node">Custom</span> },
    ];
    render(<InfoBlock title="Test" sections={sectionsWithNode} />);
    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
  });
});