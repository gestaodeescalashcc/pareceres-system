import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('relevancia');
  const [facets, setFacets] = useState(null);

  const doSearch = useCallback(async (searchQuery, searchFilters, searchPage, searchSort, searchLimit) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        q: searchQuery || undefined,
        ...searchFilters,
        page: searchPage,
        limit: searchLimit,
        sort: searchSort
      };

      const [searchResult, facetResult] = await Promise.all([
        api.search(params),
        api.facets({ q: searchQuery, ...searchFilters })
      ]);

      setResults(searchResult);
      setFacets(facetResult);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query, filters, page, sort, limit);
    }, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, filters, page, sort, limit, doSearch]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setQuery('');
    setPage(1);
    setSort('relevancia');
  }, []);

  return {
    query, setQuery,
    filters, updateFilter, clearFilters,
    results, loading, error,
    page, setPage,
    limit, setLimit,
    sort, setSort,
    facets
  };
}

export function useAutocomplete() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const fetchSuggestions = useCallback((q, filters = {}) => {
    clearTimeout(timerRef.current);
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.autocomplete(q, filters);
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, fetchSuggestions, clearSuggestions: clear, loading };
}
