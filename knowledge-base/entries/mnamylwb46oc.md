Consider implementing this instead of fixed granularity for all parameterizations:

  // During graph construction/compilation (ONCE):
  if (graph->param_length > 0) {
      // Analyze graph structure to compute max possible rate
      // Example for coalescent: with 10 lineages, max rate ≈ 45
      // With θ_max = 100, max_rate_parameterized = 45 * 100 = 4500
      graph->max_parameterized_rate = analyze_max_rate(graph, param_bounds);
  }

  // During PDF computation (MANY TIMES):
  if (granularity == 0) {
      if (graph->param_length > 0) {
          granularity = graph->max_parameterized_rate * 2;  // Scales with model
      } else {
          granularity = max_rate * 2;
      }
  }