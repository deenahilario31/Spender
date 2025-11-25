import { Users, DollarSign, Receipt, TrendingUp, UserPlus, Plus, Trash2, ArrowRight, MessageSquare, Phone, Camera, User, CreditCard, UsersRound, Percent, Edit3, Save, Sparkles } from 'lucide-react'

export default function HomeContent({ 
  people, 
  allPeople,
  expenses, 
  groups,
  currentUser,
  activeTab,
  setActiveTab,
  newPersonName,
  authenticatedUser,
  setNewPersonName,
  newPersonPhone,
  setNewPersonPhone,
  handleAddPerson,
  handleDeletePerson,
  newExpense,
  setNewExpense,
  handleAddExpense,
  handleDeleteExpense,
  handleRequestFunds,
  setShowReceiptScanner,
  showGroupForm,
  setShowGroupForm,
  selectedGroup,
  setSelectedGroup,
  handleCreateGroup,
  handleDeleteGroup,
  getCurrentUserTab,
  onOpenAssistant,
  setCurrentUser,
  userProfile,
  setShowProfileForm,
  setEditingProfile
}) {
  // Calculate balances preview
  const calculateBalancesPreview = () => {
    const balanceMatrix = {}
    
    // Initialize balance matrix
    people.forEach(person1 => {
      balanceMatrix[person1.name] = {}
      people.forEach(person2 => {
        if (person1.name !== person2.name) {
          balanceMatrix[person1.name][person2.name] = 0
        }
      })
    })

    // Calculate from expenses
    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitWith.length
      expense.splitWith.forEach(person => {
        if (person !== expense.paidBy) {
          balanceMatrix[person][expense.paidBy] += splitAmount
        }
      })
    })

    // Calculate from groups
    groups.forEach(group => {
      group.members.forEach((member, idx) => {
        if (idx > 0) {
          balanceMatrix[member][group.members[0]] += group.totalPerPerson
        }
      })
    })

    // Simplify balances
    const simplifiedBalances = []
    people.forEach(person1 => {
      people.forEach(person2 => {
        if (person1.name < person2.name) {
          const amount1to2 = balanceMatrix[person1.name][person2.name] || 0
          const amount2to1 = balanceMatrix[person2.name][person1.name] || 0
          const netAmount = amount1to2 - amount2to1
          
          if (Math.abs(netAmount) > 0.01) {
            simplifiedBalances.push({
              from: netAmount > 0 ? person1.name : person2.name,
              to: netAmount > 0 ? person2.name : person1.name,
              amount: Math.abs(netAmount)
            })
          }
        }
      })
    })

    return simplifiedBalances
  }

  const balancesPreview = calculateBalancesPreview()
  const totalOutstanding = balancesPreview.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12 animate-float relative">
        <div className="inline-flex items-center justify-center gap-4 mb-4 px-8 py-4 glass-card-dark rounded-3xl">
          <div className="p-3 gradient-primary rounded-2xl animate-glow">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">Spender</h1>
        </div>
        <p className="text-gray-300 text-xl font-light tracking-wide">Track shared expenses with elegance</p>
      </div>


      {/* Current Viewer Display */}
      {currentUser && (
        <div className="glass-card rounded-3xl shadow-2xl p-6 mb-8 border border-white/20 bg-gradient-to-br from-indigo-50/80 to-purple-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {currentUser.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Viewing as</div>
                <div className="text-2xl font-bold text-gray-900">{currentUser}</div>
                <div className="text-xs text-indigo-600 font-medium">Your Profile</div>
              </div>
            </div>
            {people.length > 0 && (
              <div className="text-right">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Switch View:</label>
                <select
                  value={currentUser || ''}
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="px-4 py-2 bg-white border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold text-sm"
                >
                  <option value={currentUser}>{currentUser} (You)</option>
                  {people.filter(p => p.name !== currentUser).map(person => (
                    <option key={person.id} value={person.name}>{person.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Open Balances Preview */}
      {balancesPreview.length > 0 && (
        <div className="glass-card rounded-3xl shadow-2xl p-6 mb-8 border border-white/20 bg-gradient-to-br from-green-50/80 to-emerald-50/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Open Balances</h3>
                <p className="text-sm text-gray-600">Quick overview of who owes whom</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 font-semibold">Total Outstanding</div>
              <div className="text-2xl font-bold text-green-600">${totalOutstanding.toFixed(2)}</div>
            </div>
          </div>

          {/* Preview of top 3 balances */}
          <div className="space-y-2 mb-4">
            {balancesPreview.slice(0, 3).map((balance, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {balance.from.charAt(0).toUpperCase()}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {balance.to.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {balance.from} → {balance.to}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${balance.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          {balancesPreview.length > 3 && (
            <div className="text-center text-sm text-gray-600 font-medium">
              +{balancesPreview.length - 3} more balance{balancesPreview.length - 3 !== 1 ? 's' : ''}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">View all balances in the Balances page</p>
              <div className="flex gap-2 justify-center text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  {balancesPreview.length} open balance{balancesPreview.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Tab Section */}
      {currentUser && getCurrentUserTab().length > 0 && (
        <div className="glass-card rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 font-mono" style={{ fontFamily: "'Courier New', monospace" }}>
              <div className="border-b-2 border-dashed border-gray-400 pb-4 mb-4">
                <h3 className="text-center text-2xl font-bold mb-2">═══ OPEN TAB ═══</h3>
                <p className="text-center text-sm">For: {currentUser}</p>
                <p className="text-center text-xs text-gray-600">───────────────────</p>
              </div>
              
              <div className="space-y-3 mb-4">
                {getCurrentUserTab().map((debt, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-300 pb-2">
                    <div className="flex-1">
                      <div className="font-bold">{debt.description}</div>
                      <div className="text-xs text-gray-600">Owed to: {debt.owedTo}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${debt.amount.toFixed(2)}</div>
                      <button
                        onClick={() => handleRequestFunds(debt.owedTo, debt.amount, currentUser)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline mt-1"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t-2 border-double border-gray-800 pt-3">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>TOTAL DUE:</span>
                  <span>${getCurrentUserTab().reduce((sum, debt) => sum + debt.amount, 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-center mt-4 text-xs text-gray-500">
                <p>═══════════════════</p>
                <p>Thank you!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Person Section */}
      <div className="glass-card rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 hover:shadow-indigo-500/20 transition-all duration-300">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          <div className="p-2 gradient-primary rounded-xl">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          Add Friend
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Friend's name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={newPersonPhone}
            onChange={(e) => setNewPersonPhone(e.target.value)}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
          />
          <button
            onClick={handleAddPerson}
            className="px-8 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
        
        {people.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map(person => (
              <div key={person.id} className="flex items-center justify-between p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">{person.name}</span>
                    {person.phone && <p className="text-xs text-gray-600">{person.phone}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePerson(person.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="flex border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 px-6 py-4 font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'expenses'
                ? 'gradient-primary text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Receipt className="w-5 h-5" />
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-6 py-4 font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'groups'
                ? 'gradient-primary text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UsersRound className="w-5 h-5" />
            Groups
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'expenses' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Add Expense
                </h2>
                <button
                  onClick={() => setShowReceiptScanner(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Scan Receipt
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
                />
                <select
                  value={newExpense.paidBy}
                  onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-semibold"
                >
                  <option value="">Who paid?</option>
                  {allPeople.map(person => (
                    <option key={person.id} value={person.name}>
                      {person.name}{person.isCurrentUser ? ' (You)' : ''}
                    </option>
                  ))}
                </select>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Split with: {newExpense.splitWith.length > 0 && (
                      <span className="ml-2 text-indigo-600">({newExpense.splitWith.length} selected)</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allPeople.map(person => (
                      <label key={person.id} className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg hover:bg-indigo-50 transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={newExpense.splitWith.includes(person.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewExpense({...newExpense, splitWith: [...newExpense.splitWith, person.name]})
                            } else {
                              setNewExpense({...newExpense, splitWith: newExpense.splitWith.filter(n => n !== person.name)})
                            }
                          }}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-gray-900">
                          {person.name}{person.isCurrentUser ? ' (You)' : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Auto-Group Indicator */}
                  {newExpense.splitWith.length > 2 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg">
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-bold text-purple-900">
                          Will auto-create group with {newExpense.splitWith.length} members! 🎉
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* SMS Notification Indicator */}
                  {newExpense.splitWith.length > 0 && newExpense.paidBy && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-bold text-blue-900">
                          SMS Notifications will be sent:
                        </span>
                      </div>
                      <div className="ml-7 space-y-1">
                        {newExpense.splitWith
                          .filter(name => name !== newExpense.paidBy)
                          .map((name, idx) => {
                            const person = people.find(p => p.name === name)
                            const amount = newExpense.amount ? (parseFloat(newExpense.amount) / newExpense.splitWith.length).toFixed(2) : '0.00'
                            return (
                              <div key={idx} className="text-xs text-blue-800 flex items-center gap-2">
                                {person?.phone ? (
                                  <>
                                    <span className="font-semibold">✓ {name}</span>
                                    <span className="text-blue-600">({person.phone})</span>
                                    <span>→ owes ${amount}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-semibold text-orange-600">✗ {name}</span>
                                    <span className="text-orange-600">(no phone number)</span>
                                  </>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddExpense}
                  className="w-full px-6 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  Add Expense
                </button>
              </div>

              {expenses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Expenses</h3>
                  {[...expenses].sort((a, b) => {
                    // Sort by date (newest first), if no date use ID (highest first)
                    const dateA = a.date ? new Date(a.date) : new Date(0)
                    const dateB = b.date ? new Date(b.date) : new Date(0)
                    if (dateA.getTime() !== dateB.getTime()) {
                      return dateB - dateA
                    }
                    return b.id - a.id
                  }).map(expense => (
                    <div key={expense.id} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900">{expense.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Paid by <span className="font-semibold text-indigo-600">{expense.paidBy}</span>
                          </p>
                          {expense.date && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <span>📅</span>
                              {new Date(expense.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                              <span className="mx-1">•</span>
                              <span>🕐</span>
                              {new Date(expense.date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">${expense.amount.toFixed(2)}</div>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="mt-2 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {expense.splitWith.map((person, idx) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dinner Party Groups
                </h2>
                <button
                  onClick={() => setShowGroupForm(true)}
                  className="px-6 py-3 gradient-primary text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-200 font-semibold flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Group
                </button>
              </div>

              {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groups.map(group => (
                    <div key={group.id} className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{group.members.length} members</p>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {group.members.map((member, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-semibold">
                            {member}
                          </span>
                        ))}
                      </div>
                      <div className="text-3xl font-bold text-purple-600">
                        ${group.totalPerPerson.toFixed(2)} <span className="text-sm text-gray-600">per person</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UsersRound className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No groups yet. Create one to split dinner bills!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating AI Assistant Bubble */}
      <button
        onClick={onOpenAssistant}
        className="fixed bottom-8 right-8 w-16 h-16 gradient-primary rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-pulse-slow z-50 group"
        style={{ 
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)'
        }}
      >
        <Sparkles className="w-8 h-8 text-white animate-float" />
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Ask AI Assistant
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
        
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping"></div>
      </button>
    </div>
  )
}
