package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "inflation",
	Short: "inflation CLI application (finance tools)",
	Long:  `The inflation CLI application is a comprehensive backend utility belonging to the finance suite of tools.

Use this root executable to manage configuring, running, and interacting with all inflation-related operations securely and efficiently from your terminal.`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
}
