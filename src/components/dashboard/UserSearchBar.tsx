import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/input'

interface UserSearchBarProps {
  onSearch: (searchTerm: string) => void
  onClear: () => void
  isSearching: boolean
}

export function UserSearchBar({ onSearch, onClear, isSearching }: UserSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim())
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    onClear()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name or location..."
          className="pl-10 pr-10 h-11 rounded-xl bg-background/50 border-input"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      <Button 
        type="submit" 
        disabled={!searchTerm.trim()}
        className="gap-2 cursor-pointer"
      >
        <Search className="w-4 h-4" />
        Search
      </Button>

      {isSearching && (
        <Button 
          type="button"
          variant="outline"
          onClick={handleClear}
          className="gap-2 cursor-pointer"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </form>
  )
}
